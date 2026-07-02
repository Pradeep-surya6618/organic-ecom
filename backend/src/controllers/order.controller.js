const orderService = require('../services/order.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

exports.createOrder = asyncHandler(async (req, res) => {
    const user = req.user || { _id: null, email: req.body.shippingAddress?.email, name: req.body.shippingAddress?.fullName };
    const order = await orderService.createOrder(user, req.body);
    res.status(201).json(new ApiResponse(201, order, 'Order placed successfully'));
});

exports.getOrders = asyncHandler(async (req, res) => {
    const result = await orderService.getOrders(req.user._id, req.query);
    res.json(new ApiResponse(200, result, 'Orders fetched'));
});

exports.getOrder = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id, req.user._id);
    res.json(new ApiResponse(200, order, 'Order fetched'));
});

exports.cancelOrder = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const order = await orderService.cancelOrder(req.params.id, req.user._id, reason);
    res.json(new ApiResponse(200, order, 'Order cancelled'));
});

exports.downloadInvoice = asyncHandler(async (req, res) => {
    const Order = require('../models/Order');
    const invoiceService = require('../services/invoice.service');
    const mongoose = require('mongoose');
    
    let order;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        order = await Order.findById(req.params.id);
    }
    if (!order) {
        order = await Order.findOne({ orderNumber: req.params.id });
    }
    
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const user = req.user || { name: order.shippingAddress.fullName, email: 'customer@example.com' };
    const pdfBuffer = await invoiceService.generateInvoice(order, user);
    
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice_${order.orderNumber}.pdf"`,
        'Content-Length': pdfBuffer.length
    });
    
    res.end(pdfBuffer);
});