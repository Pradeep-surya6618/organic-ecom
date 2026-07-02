const orderService = require('../../services/order.service');
const activityService = require('../../services/activity.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

exports.getAllOrders = asyncHandler(async (req, res) => {
    const result = await orderService.getAllOrders(req.query);
    res.json(new ApiResponse(200, result, 'All orders fetched'));
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    activityService.log({
        action: `Order ${order.orderNumber} marked as "${status}"`,
        type: 'order',
        actor: req.user?.fullName || req.user?.name || 'Admin',
        actorId: req.user?._id,
        role: req.user?.role || 'admin',
        meta: { orderNumber: order.orderNumber, status }
    });
    res.json(new ApiResponse(200, order, 'Order status updated'));
});

exports.assignDeliveryPartner = asyncHandler(async (req, res) => {
    const Order = require('../../models/Order');
    const { deliveryPartnerId } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { deliveryPartner: deliveryPartnerId, status: 'out_for_delivery' }, { new: true });
    activityService.log({
        action: `Order ${order.orderNumber} dispatched for delivery`,
        type: 'delivery',
        actor: req.user?.fullName || req.user?.name || 'Admin',
        actorId: req.user?._id,
        role: req.user?.role || 'admin',
        meta: { orderNumber: order.orderNumber }
    });
    res.json(new ApiResponse(200, order, 'Delivery partner assigned'));
});