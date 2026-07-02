// src/services/ai/OpenRouterService.js
// Talks to OpenRouter's OpenAI-compatible REST API directly via fetch — no SDK dependency.

let OPENROUTER_CONFIG;
try {
    OPENROUTER_CONFIG = require('../../config/ai.config').OPENROUTER_CONFIG;
} catch (e) {
    OPENROUTER_CONFIG = {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
        models: [
            { name: 'openai/gpt-4o-mini', maxTokens: 800, temperature: 0.6 },
            { name: 'anthropic/claude-3.5-haiku', maxTokens: 800, temperature: 0.6 },
            { name: 'google/gemini-1.5-flash', maxTokens: 800, temperature: 0.6 },
            { name: 'meta-llama/llama-3.2-3b-instruct', maxTokens: 800, temperature: 0.6 }
        ],
        timeout: 15000,
        headers: {
            'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
            'X-Title': 'Organic Store AI Chat'
        }
    };
}

const logger = {
    info: (msg, ...a) => console.log(`[AI] ${msg}`, ...a),
    error: (msg, ...a) => console.error(`[AI] ${msg}`, ...a)
};

class OpenRouterService {
    constructor() {
        this.apiKey = OPENROUTER_CONFIG.apiKey;
        this.conversations = new Map();
        if (!this.apiKey) {
            console.warn('⚠️  OPENROUTER_API_KEY not set — AI chat will use the rule-based fallback.');
        }
    }

    async chat(userId, message, context = {}) {
        // Degrade gracefully if we can't reach the LLM
        if (!this.apiKey || typeof fetch === 'undefined') {
            return this.ruleBasedFallback(message, context);
        }

        const history = this.getHistory(userId);
        history.push({ role: 'user', content: message });

        const messages = [
            { role: 'system', content: context.systemPrompt || this.buildSystemPrompt(context) },
            ...history.slice(-10).map((h) => ({ role: h.role, content: h.content }))
        ];

        for (let i = 0; i < OPENROUTER_CONFIG.models.length; i++) {
            const modelConfig = OPENROUTER_CONFIG.models[i];
            try {
                const reply = await this.callModel(modelConfig, messages);
                history.push({ role: 'assistant', content: reply });
                this.trimHistory(history);
                this.conversations.set(userId, history);
                return { success: true, response: reply, model: modelConfig.name, fallbackUsed: i > 0 };
            } catch (error) {
                logger.error(`Model ${modelConfig.name} failed: ${error.message}`);
            }
        }

        // Every model failed — remove the dangling user turn and use the fallback
        history.pop();
        return this.ruleBasedFallback(message, context);
    }

    /**
     * Streaming variant. Calls onToken(delta) as tokens arrive and resolves with
     * { success, response, model, fallbackUsed }.
     */
    async chatStream(userId, message, context = {}, onToken = () => {}) {
        if (!this.apiKey || typeof fetch === 'undefined') {
            const text = this.ruleBasedFallback(message, context);
            onToken(text);
            return { success: false, response: text, model: 'fallback', fallbackUsed: true };
        }

        const history = this.getHistory(userId);
        history.push({ role: 'user', content: message });
        const messages = [
            { role: 'system', content: context.systemPrompt || this.buildSystemPrompt(context) },
            ...history.slice(-10).map((h) => ({ role: h.role, content: h.content }))
        ];

        for (let i = 0; i < OPENROUTER_CONFIG.models.length; i++) {
            const modelConfig = OPENROUTER_CONFIG.models[i];
            try {
                const full = await this.streamModel(modelConfig, messages, onToken);
                if (!full || !full.trim()) throw new Error('Empty stream');
                history.push({ role: 'assistant', content: full });
                this.trimHistory(history);
                this.conversations.set(userId, history);
                return { success: true, response: full, model: modelConfig.name, fallbackUsed: i > 0 };
            } catch (error) {
                logger.error(`Stream model ${modelConfig.name} failed: ${error.message}`);
            }
        }

        history.pop();
        const text = this.ruleBasedFallback(message, context);
        onToken(text);
        return { success: false, response: text, model: 'fallback', fallbackUsed: true };
    }

    async streamModel(modelConfig, messages, onToken) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), OPENROUTER_CONFIG.timeout || 15000);
        try {
            const res = await fetch(`${OPENROUTER_CONFIG.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                    ...(OPENROUTER_CONFIG.headers || {})
                },
                body: JSON.stringify({
                    model: modelConfig.name,
                    messages,
                    temperature: modelConfig.temperature,
                    max_tokens: modelConfig.maxTokens,
                    stream: true
                }),
                signal: controller.signal
            });
            if (!res.ok || !res.body) {
                const txt = await res.text().catch(() => '');
                throw new Error(`HTTP ${res.status} ${txt.slice(0, 140)}`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let full = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // keep the trailing partial line
                for (const raw of lines) {
                    const line = raw.trim();
                    if (!line || line.startsWith(':') || !line.startsWith('data:')) continue;
                    const data = line.slice(5).trim();
                    if (data === '[DONE]') return full;
                    try {
                        const json = JSON.parse(data);
                        const delta = json.choices?.[0]?.delta?.content;
                        if (delta) {
                            full += delta;
                            onToken(delta);
                        }
                    } catch (_) {
                        /* ignore keep-alive / partial JSON */
                    }
                }
            }
            return full;
        } finally {
            clearTimeout(timer);
        }
    }

    async callModel(modelConfig, messages) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), OPENROUTER_CONFIG.timeout || 15000);
        try {
            const res = await fetch(`${OPENROUTER_CONFIG.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                    ...(OPENROUTER_CONFIG.headers || {})
                },
                body: JSON.stringify({
                    model: modelConfig.name,
                    messages,
                    temperature: modelConfig.temperature,
                    max_tokens: modelConfig.maxTokens
                }),
                signal: controller.signal
            });
            if (!res.ok) {
                const txt = await res.text().catch(() => '');
                throw new Error(`HTTP ${res.status} ${txt.slice(0, 140)}`);
            }
            const data = await res.json();
            const reply = data?.choices?.[0]?.message?.content?.trim();
            if (!reply) throw new Error('Empty AI response');
            return reply;
        } finally {
            clearTimeout(timer);
        }
    }

    /** One-shot completion (no history) — used for content generation. Returns text or null. */
    async generate(systemPrompt, userPrompt) {
        if (!this.apiKey || typeof fetch === 'undefined') return null;
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];
        for (let i = 0; i < OPENROUTER_CONFIG.models.length; i++) {
            try {
                return await this.callModel(OPENROUTER_CONFIG.models[i], messages);
            } catch (error) {
                logger.error(`generate ${OPENROUTER_CONFIG.models[i].name} failed: ${error.message}`);
            }
        }
        return null;
    }

    buildSystemPrompt(context) {
        const catalog = (context.products || [])
            .map((p) => {
                const unit = p.unit && p.unit !== 'piece' ? `/${p.unit}` : '';
                const cat = p.category ? ` (${p.category})` : '';
                return `- ${p.name} — ₹${p.price}${unit}${cat} — ${p.inStock ? 'in stock' : 'OUT OF STOCK'}`;
            })
            .join('\n');

        const orders = (context.activeOrders || [])
            .map((o) => `- ${o.orderNumber}: ${o.status}${o.total != null ? `, ₹${o.total}` : ''}`)
            .join('\n');

        const pages = (context.pages || [])
            .map((p) => `### ${p.title} (/page/${p.slug})\n${p.body}`)
            .join('\n\n');

        return `You are OrganicBot, the friendly shopping assistant for Organic Store, an online organic grocery in India.

STORE FACTS:
- Express delivery in ~10 minutes; hours 7am–11pm.
- Free delivery over ₹500, otherwise ₹40. A 5% tax applies.
- Payments via Razorpay (UPI, cards, net banking). Easy freshness-based refunds.

RULES:
- Be warm and concise (2–4 sentences). Show all prices in ₹.
- Use ONLY the product catalog below for products and prices — never invent items or prices.
- If something is out of stock, suggest an in-stock alternative from the catalog.
- The user can perform actions by typing simple commands the app understands, e.g. "add 2 spinach to cart", "go to checkout", "reorder", "track my order". When they want to act, tell them the exact command.
- ${context.user ? `The signed-in customer is ${context.user.fullName || 'a customer'}.` : 'The user is a guest (not signed in). To place/track orders they should sign in.'}
${orders ? `\nTHEIR RECENT ORDERS:\n${orders}` : ''}
${pages ? `\nSTORE INFO & POLICIES — use these to answer FAQ, shipping, returns, privacy and about questions faithfully; don't contradict them:\n${pages}` : ''}

PRODUCT CATALOG:
${catalog || '(catalog unavailable right now)'}`;
    }

    ruleBasedFallback(message) {
        const lower = (message || '').toLowerCase();
        if (lower.match(/hello|hi|hey/)) {
            return "👋 Hi! I'm OrganicBot. I can help you find products, manage your cart, track orders, or reorder. Try 'do you have honey?' or 'track my order'.";
        }
        if (lower.match(/deliver|how fast|time/)) {
            return '🚚 We deliver fresh organic produce in about 10 minutes, 7am–11pm. Free delivery over ₹500!';
        }
        if (lower.match(/refund|return/)) {
            return '🛡️ We offer easy, freshness-based refunds — just reach out if anything isn’t perfect.';
        }
        if (lower.match(/pay|razorpay|upi/)) {
            return '💳 Payments are handled securely via Razorpay — UPI, cards, and net banking.';
        }
        return "🌿 I'm here to help! Try 'search apples', 'add 2 bananas to cart', 'track my order', or 'reorder'.";
    }

    getHistory(userId) {
        if (!this.conversations.has(userId)) this.conversations.set(userId, []);
        return this.conversations.get(userId);
    }

    clearHistory(userId) {
        this.conversations.delete(userId);
    }

    trimHistory(history) {
        if (history.length > 20) {
            const recent = history.slice(-18);
            history.length = 0;
            history.push(...recent);
        }
    }

    getHealthStatus() {
        return {
            provider: 'openrouter',
            apiKeyConfigured: !!this.apiKey,
            fetchAvailable: typeof fetch !== 'undefined',
            models: OPENROUTER_CONFIG.models.map((m) => m.name),
            activeConversations: this.conversations.size
        };
    }
}

module.exports = new OpenRouterService();
