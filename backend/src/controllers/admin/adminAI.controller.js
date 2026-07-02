// src/controllers/admin/adminAI.controller.js
const openRouterService = require('../../services/ai/OpenRouterService');
const analyticsService = require('../../services/analytics.service');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const Category = require('../../models/Category');
const Testimonial = require('../../models/Testimonial');
const Contact = require('../../models/Contact');
const ChatFeedback = require('../../models/ChatFeedback');
const activityService = require('../../services/activity.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

class AdminAIController {
    /** Admin copilot chat — grounded in live store analytics & operational data. */
    chat = asyncHandler(async (req, res) => {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // Deterministic action detection first — returns a preview to confirm (never auto-runs).
        const action = await this.detectAction(message.trim());
        if (action) {
            return res.json(new ApiResponse(200, {
                message: action.message,
                proposedAction: action.proposedAction || null,
                model: 'rules',
                fallbackUsed: false
            }, 'Admin AI response'));
        }

        const userId = `admin_${req.user?._id || req.ip}`;
        const systemPrompt = await this.buildAdminPrompt();
        const result = await openRouterService.chat(userId, message.trim(), { systemPrompt });
        res.json(new ApiResponse(200, {
            message: result.response,
            model: result.model || 'fallback',
            fallbackUsed: !!result.fallbackUsed
        }, 'Admin AI response'));
    });

    // ── Helpers ──
    slugify(str) {
        return String(str || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    escapeRegex(str) {
        return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    mapStatus(lower) {
        if (/cancel/.test(lower)) return 'cancelled';
        if (/out[\s-]?for[\s-]?delivery|dispatch|ship/.test(lower)) return 'out_for_delivery';
        if (/deliver/.test(lower)) return 'delivered';
        if (/packed|\bpack\b/.test(lower)) return 'packed';
        if (/process|packing|prepar/.test(lower)) return 'processing';
        if (/confirm/.test(lower)) return 'confirmed';
        return null;
    }
    async resolveProduct(nameRaw) {
        const name = (nameRaw || '').trim().replace(/[."']+$/, '');
        if (!name) return null;
        return (
            (await Product.findOne({ name: new RegExp('^' + this.escapeRegex(name) + '$', 'i') })) ||
            (await Product.findOne({ name: new RegExp(this.escapeRegex(name), 'i') }))
        );
    }

    /**
     * Detect a mutating command and return a preview + proposedAction (to confirm),
     * or an informational message when the target can't be resolved, or null to
     * hand off to the conversational AI.
     */
    async detectAction(message) {
        const lower = message.toLowerCase();

        // 0a) Draft a reply to the latest customer message (generate — no confirm needed)
        if (/draft/.test(lower) && /repl/.test(lower)) {
            const contact = await Contact.findOne().sort('-createdAt');
            if (!contact) return { message: 'There are no customer messages to reply to yet.' };
            const system =
                'You are a friendly, professional customer support agent for Organic Store, an Indian organic grocery. Write a concise, warm reply (3-5 sentences). Sign off as "Team Organic Store". Plain text only.';
            const reply = await openRouterService.generate(
                system,
                `Customer ${contact.name} wrote${contact.subject ? ` (subject: ${contact.subject})` : ''}:\n"${contact.message}"\n\nWrite a helpful reply.`
            );
            if (!reply) return { message: 'The AI is unavailable right now — please try again shortly.' };
            return { message: `✍️ Draft reply to ${contact.name} (${contact.email}):\n\n${reply.trim()}` };
        }

        // 0b) Bulk: hide all out-of-stock products (confirm)
        if (/hide/.test(lower) && /(out[\s-]?of[\s-]?stock|oos)/.test(lower)) {
            const count = await Product.countDocuments({ isActive: true, stock: 0 });
            if (count === 0) return { message: 'There are no out-of-stock products to hide right now. ✅' };
            return {
                message: `Hide all **${count}** out-of-stock product(s) from the storefront?`,
                proposedAction: { tool: 'bulk_hide_out_of_stock', params: { count }, confirmLabel: `Hide ${count} product(s)` }
            };
        }

        // 1) Order status change
        const ordM = message.match(/\bORD\d+/i);
        const status = this.mapStatus(lower);
        if (ordM && status) {
            const orderNumber = ordM[0].toUpperCase();
            const order = await Order.findOne({ orderNumber });
            if (!order) return { message: `I couldn't find order ${orderNumber}. Please check the number.` };
            if (order.status === status) return { message: `Order ${orderNumber} is already "${status}".` };
            return {
                message: `Change order **${orderNumber}** from "${order.status}" to "${status}"?`,
                proposedAction: { tool: 'update_order_status', params: { orderNumber, status }, confirmLabel: `Mark ${status}` }
            };
        }

        // 2) Stock update
        const sm =
            lower.match(/(?:set|update|change)\s+(?:the\s+)?stock\s+(?:of|for)\s+(.+?)\s+to\s+(\d+)/i) ||
            lower.match(/restock\s+(.+?)\s+to\s+(\d+)/i) ||
            lower.match(/(?:set|update|change)\s+(.+?)\s+stock\s+to\s+(\d+)/i);
        if (sm) {
            const qty = parseInt(sm[2], 10);
            const product = await this.resolveProduct(sm[1]);
            if (!product) return { message: `I couldn't find a product matching "${sm[1].trim()}".` };
            return {
                message: `Set stock of **${product.name}** from ${product.stock} to ${qty}?`,
                proposedAction: { tool: 'update_stock', params: { productId: String(product._id), quantity: qty, name: product.name }, confirmLabel: 'Update stock' }
            };
        }

        // 3) Product visibility
        const vm = lower.match(/^(hide|unhide|show|activate|deactivate|disable|enable)\s+(.+)$/i);
        if (vm) {
            const verb = vm[1].toLowerCase();
            const makeActive = /unhide|activate|enable|show/.test(verb);
            const product = await this.resolveProduct(vm[2]);
            if (!product) {
                if (verb === 'show') return null; // "show ..." is likely a question — let the AI handle it
                return { message: `I couldn't find a product matching "${vm[2].trim()}".` };
            }
            if (product.isActive === makeActive) {
                return { message: `**${product.name}** is already ${makeActive ? 'visible' : 'hidden'}.` };
            }
            return {
                message: `${makeActive ? 'Show' : 'Hide'} **${product.name}** on the storefront?`,
                proposedAction: {
                    tool: 'set_product_active',
                    params: { productId: String(product._id), isActive: makeActive, name: product.name },
                    confirmLabel: makeActive ? 'Show product' : 'Hide product'
                }
            };
        }

        // 4) Create category
        const cc = lower.match(/(?:create|add|new)\s+category\s+(?:called\s+|named\s+)?["']?(.+?)["']?$/i);
        if (cc) {
            const name = cc[1].trim().replace(/[."']+$/, '');
            if (!name) return { message: 'What should the new category be called?' };
            const slug = this.slugify(name);
            const exists = await Category.findOne({ $or: [{ name: new RegExp('^' + this.escapeRegex(name) + '$', 'i') }, { slug }] });
            if (exists) return { message: `A category "${name}" already exists.` };
            return {
                message: `Create a new category **${name}**?`,
                proposedAction: { tool: 'create_category', params: { name }, confirmLabel: 'Create category' }
            };
        }

        // 5) Delete category (blocked if products are linked)
        const cd = lower.match(/(?:delete|remove)\s+category\s+(?:called\s+|named\s+)?["']?(.+?)["']?$/i);
        if (cd) {
            const name = cd[1].trim().replace(/[."']+$/, '');
            const category =
                (await Category.findOne({ name: new RegExp('^' + this.escapeRegex(name) + '$', 'i') })) ||
                (await Category.findOne({ name: new RegExp(this.escapeRegex(name), 'i') }));
            if (!category) return { message: `I couldn't find a category matching "${name}".` };
            const linked = await Product.countDocuments({ category: category._id });
            if (linked > 0) {
                return { message: `Can't delete **${category.name}** — ${linked} product(s) are linked to it. Reassign or remove them first.` };
            }
            return {
                message: `Delete category **${category.name}**? It has no linked products.`,
                proposedAction: { tool: 'delete_category', params: { categoryId: String(category._id), name: category.name }, confirmLabel: 'Delete category' }
            };
        }

        return null;
    }

    /** Execute a confirmed action, log it to the Activity Log, and return a result message. */
    execute = asyncHandler(async (req, res) => {
        const action = req.body.action || req.body;
        const { tool, params = {} } = action || {};
        const logCommon = {
            actor: req.user?.fullName || req.user?.name || 'Admin',
            actorId: req.user?._id,
            role: req.user?.role || 'admin'
        };
        let message;

        switch (tool) {
            case 'update_order_status': {
                const order = await Order.findOne({ orderNumber: params.orderNumber });
                if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
                order.status = params.status;
                if (params.status === 'delivered') order.actualDelivery = new Date();
                await order.save();
                activityService.log({ action: `Order ${order.orderNumber} marked "${params.status}" (via Copilot)`, type: 'order', ...logCommon, meta: { orderNumber: order.orderNumber, status: params.status } });
                message = `✅ Order ${order.orderNumber} is now "${params.status}".`;
                break;
            }
            case 'update_stock': {
                const product = await Product.findByIdAndUpdate(params.productId, { stock: Number(params.quantity) }, { new: true });
                if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
                activityService.log({ action: `Stock for "${product.name}" set to ${params.quantity} (via Copilot)`, type: 'product', ...logCommon, meta: { productId: String(product._id), stock: Number(params.quantity) } });
                message = `✅ Stock for "${product.name}" is now ${params.quantity}.`;
                break;
            }
            case 'set_product_active': {
                const product = await Product.findByIdAndUpdate(params.productId, { isActive: !!params.isActive }, { new: true });
                if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
                activityService.log({ action: `Product "${product.name}" ${params.isActive ? 'shown' : 'hidden'} (via Copilot)`, type: 'product', ...logCommon, meta: { productId: String(product._id), isActive: !!params.isActive } });
                message = `✅ "${product.name}" is now ${params.isActive ? 'visible' : 'hidden'}.`;
                break;
            }
            case 'create_category': {
                const name = (params.name || '').trim();
                if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });
                const slug = this.slugify(name);
                const exists = await Category.findOne({ $or: [{ name: new RegExp('^' + this.escapeRegex(name) + '$', 'i') }, { slug }] });
                if (exists) return res.status(400).json({ success: false, message: 'A category with this name already exists' });
                const cat = await Category.create({ name, slug });
                activityService.log({ action: `Category "${cat.name}" created (via Copilot)`, type: 'catalog', ...logCommon, meta: { categoryId: String(cat._id) } });
                message = `✅ Category "${cat.name}" created.`;
                break;
            }
            case 'delete_category': {
                const category = await Category.findById(params.categoryId);
                if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
                const linked = await Product.countDocuments({ category: category._id });
                if (linked > 0) return res.status(400).json({ success: false, message: `Cannot delete — ${linked} product(s) are linked.` });
                await Category.findByIdAndDelete(category._id);
                activityService.log({ action: `Category "${category.name}" deleted (via Copilot)`, type: 'catalog', ...logCommon, meta: { categoryId: String(params.categoryId) } });
                message = `✅ Category "${category.name}" deleted.`;
                break;
            }
            case 'bulk_hide_out_of_stock': {
                const result = await Product.updateMany({ isActive: true, stock: 0 }, { isActive: false });
                const n = result.modifiedCount ?? result.nModified ?? 0;
                activityService.log({ action: `Hid ${n} out-of-stock product(s) (via Copilot)`, type: 'product', ...logCommon, meta: { count: n } });
                message = `✅ Hid ${n} out-of-stock product(s) from the storefront.`;
                break;
            }
            default:
                return res.status(400).json({ success: false, message: 'Unknown action' });
        }

        res.json(new ApiResponse(200, { message }, 'Action executed'));
    });

    /** Generate a marketing product description for the product form. */
    generateProductDescription = asyncHandler(async (req, res) => {
        const { name, category, price, tags } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Product name is required' });
        }
        const system =
            'You are a copywriter for an Indian organic grocery store. Write a concise, appealing product description of 2-3 sentences (about 40-60 words). Emphasise freshness, organic quality, and everyday use. Output plain text only — no markdown, no surrounding quotes, no headings.';
        const user = `Write a product description for: ${name.trim()}${category ? ` (category: ${category})` : ''}${price ? `, priced around ₹${price}` : ''}${tags ? `, tags: ${tags}` : ''}.`;

        const description = await openRouterService.generate(system, user);
        if (!description) {
            return res.status(503).json({ success: false, message: 'AI is unavailable right now. Please try again.' });
        }
        res.json(new ApiResponse(200, { description: description.replace(/^["']+|["']+$/g, '').trim() }, 'Description generated'));
    });

    /** Draft a support reply to a specific customer message (for the Messages page). */
    draftReply = asyncHandler(async (req, res) => {
        const { name, subject, message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }
        const system =
            'You are a friendly, professional customer support agent for Organic Store, an Indian organic grocery. Write a concise, warm reply (3-5 sentences) that addresses the customer\'s message. Sign off as "Team Organic Store". Plain text only — no markdown.';
        const user = `Customer ${name || 'there'} wrote${subject ? ` (subject: ${subject})` : ''}:\n"${message}"\n\nWrite a helpful reply.`;
        const reply = await openRouterService.generate(system, user);
        if (!reply) {
            return res.status(503).json({ success: false, message: 'AI is unavailable right now. Please try again.' });
        }
        res.json(new ApiResponse(200, { reply: reply.trim() }, 'Reply drafted'));
    });

    /** Assemble a compact live snapshot of the store for grounding. */
    async buildAdminPrompt() {
        const [stats, chart, top] = await Promise.all([
            analyticsService.getDashboardStats().catch(() => ({})),
            analyticsService.getSalesChart(7).catch(() => []),
            analyticsService.getTopProducts(5).catch(() => [])
        ]);

        const [statusAgg, lowStock, outOfStock, pendingReviews, unreadMessages, downFeedback, recentOrders, recentReviews] =
            await Promise.all([
                Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).catch(() => []),
                Product.find({ isActive: true, stock: { $gt: 0, $lte: 10 } }).select('name stock').sort({ stock: 1 }).limit(20),
                Product.find({ isActive: true, stock: 0 }).select('name').limit(20),
                Testimonial.countDocuments({ status: 'pending' }).catch(() => 0),
                Contact.countDocuments({ isRead: false }).catch(() => 0),
                ChatFeedback.countDocuments({ rating: 'down' }).catch(() => 0),
                Order.find().select('orderNumber status pricing.total createdAt').sort('-createdAt').limit(10),
                Testimonial.find().select('author rating text status').sort('-createdAt').limit(15).catch(() => [])
            ]);

        const salesLines = (chart || []).map((d) => `${d._id}: ${inr(d.sales)} (${d.orders} orders)`).join('\n') || 'no sales in the last 7 days';
        const topLines = (top || []).map((p, i) => `${i + 1}. ${p.name} — ${p.totalSold} sold, ${inr(p.revenue)}`).join('\n') || 'none';
        const statusLines = statusAgg.map((s) => `${s._id}: ${s.count}`).join(', ') || 'none';
        const lowLines = lowStock.map((p) => `${p.name} (${p.stock})`).join(', ') || 'none';
        const oosLines = outOfStock.map((p) => p.name).join(', ') || 'none';
        const recentLines = recentOrders.map((o) => `${o.orderNumber}: ${o.status}, ${inr(o.pricing?.total)}`).join('\n') || 'none';
        const reviewLines = (recentReviews || [])
            .map((r) => `[${r.rating || '?'}★, ${r.status}] "${(r.text || '').slice(0, 120)}" — ${r.author || 'Anon'}`)
            .join('\n') || 'no reviews yet';

        return `You are the Admin Copilot for the Organic Store admin dashboard. You help the store owner understand performance and operations.

RULES:
- Answer ONLY from the live data below. If it isn't covered, say you don't have that data.
- Be concise, use ₹ and real numbers, and when useful suggest the next action (e.g. "restock X", "moderate N reviews", "reply to unread messages").
- You cannot change data yet — for actions like editing stock, cancelling orders or moderating reviews, point the admin to the relevant admin page (Products, Live Order Queue, Customer Reviews, Customer Messages).

=== LIVE STORE DATA (right now) ===
KPIs: all-time revenue ${inr(stats.totalRevenue)}, orders ${stats.totalOrders || 0}, customers ${stats.totalUsers || 0}, active products ${stats.totalProducts || 0}.
Today: ${stats.ordersToday || 0} orders, ${inr(stats.revenueToday)} revenue.
Orders by status: ${statusLines}.
Sales (last 7 days):
${salesLines}
Top-selling products:
${topLines}
Low stock (≤10 units): ${lowLines}
Out of stock: ${oosLines}
Pending reviews to moderate: ${pendingReviews}. Unread customer messages: ${unreadMessages}. Negative AI-chat feedback (👎): ${downFeedback}.
Recent orders:
${recentLines}
Recent customer reviews (for sentiment questions):
${reviewLines}`;
    }
}

module.exports = new AdminAIController();
