// src/controllers/chat.controller.js
const openRouterService = require('../services/ai/OpenRouterService');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Page = require('../models/Page');
const ChatFeedback = require('../models/ChatFeedback');
const activityService = require('../services/activity.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

class ChatController {
    /**
     * Conversational AI endpoint. The storefront widget handles concrete actions
     * (add to cart, navigate, reorder) client-side; this endpoint answers open
     * questions grounded in the real product catalog and the user's orders.
     */
    chat = asyncHandler(async (req, res) => {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const userId = req.user?._id?.toString() || `guest_${req.ip}`;
        const context = await this.buildContext(req.user);
        const aiResult = await openRouterService.chat(userId, message.trim(), context);

        res.json(new ApiResponse(200, {
            message: aiResult.response,
            model: aiResult.model || 'fallback',
            fallbackUsed: !!aiResult.fallbackUsed
        }, 'Chat response'));
    });

    /**
     * Streaming chat endpoint (Server-Sent Events). Emits { token } events as the
     * answer is generated, then a final { done, model, fallbackUsed } event.
     */
    chatStream = asyncHandler(async (req, res) => {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const userId = req.user?._id?.toString() || `guest_${req.ip}`;
        const context = await this.buildContext(req.user);

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        if (typeof res.flushHeaders === 'function') res.flushHeaders();

        const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

        try {
            const result = await openRouterService.chatStream(userId, message.trim(), context, (token) => send({ token }));
            send({ done: true, model: result.model, fallbackUsed: result.fallbackUsed });
        } catch (err) {
            send({ token: '\n\n(Sorry, something went wrong.)' });
            send({ done: true, error: true });
        }
        res.end();
    });

    /** Store thumbs up/down feedback on an AI answer (for tuning). */
    submitFeedback = asyncHandler(async (req, res) => {
        const { rating, userMessage, botMessage, comment } = req.body;
        if (!['up', 'down'].includes(rating)) {
            return res.status(400).json({ success: false, message: 'rating must be "up" or "down"' });
        }
        await ChatFeedback.create({
            rating,
            userMessage: (userMessage || '').slice(0, 1000),
            botMessage: (botMessage || '').slice(0, 2000),
            comment: (comment || '').slice(0, 1000),
            user: req.user?._id
        });
        // Surface negative feedback in the admin activity log so it gets noticed.
        if (rating === 'down') {
            activityService.log({
                action: 'Customer gave 👎 on an AI chat answer',
                type: 'system',
                actor: req.user?.fullName || req.user?.name || 'Customer',
                actorId: req.user?._id,
                role: req.user ? 'customer' : 'guest',
                meta: { question: (userMessage || '').slice(0, 200) }
            });
        }
        res.json(new ApiResponse(200, null, 'Thanks for the feedback'));
    });

    /** Build grounding context from the real models. */
    async buildContext(user) {
        const context = { user: null, activeOrders: [], products: [], pages: [] };

        const products = await Product.find({ isActive: true })
            .select('name price stock organic unit category isFeatured')
            .populate('category', 'name')
            .sort({ isFeatured: -1, createdAt: -1 })
            .limit(50);

        context.products = products.map((p) => ({
            name: p.name,
            price: p.price,
            category: p.category?.name || '',
            unit: p.unit || 'piece',
            inStock: (p.stock ?? 0) > 0,
            organic: p.organic !== false
        }));

        // Editable content pages (About, FAQ, Shipping, Returns, Privacy, Terms) —
        // let the AI answer policy/FAQ questions grounded in the real page text.
        const pages = await Page.find().select('slug title body').limit(12);
        context.pages = pages.map((p) => ({
            title: p.title,
            slug: p.slug,
            body: (p.body || '').slice(0, 900)
        }));

        if (user) {
            context.user = { fullName: user.fullName || user.name, email: user.email };
            const orders = await Order.find({ user: user._id })
                .select('orderNumber status pricing.total estimatedDelivery createdAt')
                .sort('-createdAt')
                .limit(5);
            context.activeOrders = orders.map((o) => ({
                orderNumber: o.orderNumber,
                status: o.status,
                total: o.pricing?.total,
                estimatedDelivery: o.estimatedDelivery
            }));
        }

        return context;
    }

    health = asyncHandler(async (req, res) => {
        res.json(new ApiResponse(200, openRouterService.getHealthStatus(), 'AI service health'));
    });

    clearHistory = asyncHandler(async (req, res) => {
        const userId = req.user?._id?.toString() || `guest_${req.ip}`;
        openRouterService.clearHistory(userId);
        res.json(new ApiResponse(200, null, 'Chat history cleared'));
    });
}

module.exports = new ChatController();
