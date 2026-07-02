const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const invoiceService = require('./invoice.service');
const activityService = require('./activity.service');
const { sendEmail } = require('../config/nodemailer');

class OrderService {
    async createOrder(user, orderData) {
        if (!orderData.items || orderData.items.length === 0) throw new ApiError(400, 'Order items are required');

        const items = orderData.items.map(item => ({
            product: item.id || item.product || item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image || (item.images && item.images[0]?.filename)
        }));

        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = subtotal > 500 ? 0 : 40;
        const tax = Math.round(subtotal * 0.05);
        const total = subtotal + shipping + tax;

        const isOnline = orderData.paymentMethod === 'online';
        const p = orderData.payment || {};
        const order = await Order.create({
            user: user._id || undefined,
            items,
            shippingAddress: orderData.shippingAddress,
            pricing: { subtotal, shipping, tax, discount: 0, total },
            paymentMethod: orderData.paymentMethod || 'online',
            paymentStatus: isOnline ? 'completed' : 'pending',
            payment: isOnline ? {
                razorpayOrderId: p.razorpayOrderId,
                razorpayPaymentId: p.razorpayPaymentId,
                razorpaySignature: p.razorpaySignature,
                amount: p.amount != null ? p.amount : total,
                paidAt: new Date()
            } : undefined,
            status: 'confirmed',
            estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        });

        const mongoose = require('mongoose');
        for (const item of items) {
            if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } }).catch(() => {});
            }
        }

        try {
            const pdfBuffer = await invoiceService.generateInvoice(order, user);
            await sendEmail({
                email: user.email,
                subject: `Order Confirmation - ${order.orderNumber}`,
                message: `Thank you for your order, ${user.name}!\n\nYour order ${order.orderNumber} has been placed successfully. Please find your invoice attached.`,
                attachments: [
                    {
                        filename: `Invoice_${order.orderNumber}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }
                ]
            });
        } catch (err) {
            console.error('Invoice/Email error:', err);
        }

        activityService.log({
            action: `New order ${order.orderNumber} placed · ₹${total} · ${isOnline ? 'Paid online' : 'COD'}`,
            type: 'order',
            actor: orderData.shippingAddress?.fullName || user.name || 'Customer',
            actorId: user._id || undefined,
            role: user._id ? 'customer' : 'guest',
            meta: { orderNumber: order.orderNumber, total, paymentMethod: order.paymentMethod }
        });

        return order;
    }

    async getOrders(userId, query = {}) {
        const { page = 1, limit = 10, status } = query;
        const filter = { user: userId };
        if (status) filter.status = status;
        const orders = await Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
        const total = await Order.countDocuments(filter);
        return { orders, total, page: parseInt(page), pages: Math.ceil(total / limit) };
    }

    async getOrderById(orderId, userId) {
        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) throw new ApiError(404, 'Order not found');
        return order;
    }

    async cancelOrder(orderId, userId, reason) {
        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) throw new ApiError(404, 'Order not found');
        if (order.status !== 'pending' && order.status !== 'confirmed') {
            throw new ApiError(400, 'Order cannot be cancelled');
        }
        order.status = 'cancelled';
        order.cancellationReason = reason;
        await order.save();

        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
        return order;
    }

    async getAllOrders(query = {}) {
        const { page = 1, limit = 20, status, search } = query;
        const filter = {};
        if (status) filter.status = status;
        if (search) filter.orderNumber = new RegExp(search, 'i');
        const orders = await Order.find(filter).populate('user', 'fullName email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
        const total = await Order.countDocuments(filter);
        return { orders, total, page: parseInt(page), pages: Math.ceil(total / limit) };
    }

    async updateOrderStatus(orderId, status) {
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!order) throw new ApiError(404, 'Order not found');
        return order;
    }
}
module.exports = new OrderService();