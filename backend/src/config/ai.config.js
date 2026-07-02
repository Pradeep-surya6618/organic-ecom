// src/config/ai.config.js

/**
 * OpenRouter Configuration
 * Get API key from: https://openrouter.ai/keys
 * Browse models: https://openrouter.ai/models
 */

const OPENROUTER_CONFIG = {
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    
    // Model fallback chain (priority order)
    models: [
        {
            name: 'openai/gpt-4o-mini',           // Primary - fast & cheap
            maxTokens: 1000,
            temperature: 0.7
        },
        {
            name: 'anthropic/claude-3.5-haiku',  // Fallback 1
            maxTokens: 1000,
            temperature: 0.7
        },
        {
            name: 'google/gemini-1.5-flash',     // Fallback 2
            maxTokens: 1000,
            temperature: 0.7
        },
        {
            name: 'meta-llama/llama-3.2-3b-instruct', // Fallback 3 - free tier
            maxTokens: 1000,
            temperature: 0.7
        }
    ],
    
    timeout: 15000,        // 15 seconds per request
    maxRetries: 2,
    
    // OpenRouter specific headers
    headers: {
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
        'X-Title': 'Organic Store AI Chat'
    }
};

// Validate config
if (!OPENROUTER_CONFIG.apiKey) {
    console.warn('⚠️  OPENROUTER_API_KEY not set. AI chat will use rule-based fallback only.');
}

module.exports = { OPENROUTER_CONFIG };