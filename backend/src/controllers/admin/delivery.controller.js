const Delivery = require('../../models/Delivery');
const Order = require('../../models/Order');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

exports.getAssignedOrders = asyncHandler(async (req, res) => {
    const deliveries = await Delivery.find({ deliveryPartner: req.user._id }).populate('order');
    res.json(new ApiResponse(200, deliveries, 'Assigned orders fetched'));
});

exports.updateLocation = asyncHandler(async (req, res) => {
    const { lat, lng } = req.body;
    const delivery = await Delivery.findOneAndUpdate(
        { deliveryPartner: req.user._id, _id: req.params.id },
        { currentLocation: { lat, lng, updatedAt: new Date() } },
        { new: true }
    );
    res.json(new ApiResponse(200, delivery, 'Location updated'));
});

exports.updateDeliveryStatus = asyncHandler(async (req, res) => {
    const { status, otp } = req.body;
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) throw new ApiError(404, 'Delivery not found');
    if (status === 'delivered' && delivery.otp !== otp) throw new ApiError(400, 'Invalid delivery OTP');
    delivery.status = status;
    if (status === 'delivered') {
        delivery.deliveryTime = new Date();
        delivery.otpVerified = true;
        await Order.findByIdAndUpdate(delivery.order, { status: 'delivered', actualDelivery: new Date() });
    }
    await delivery.save();
    res.json(new ApiResponse(200, delivery, 'Delivery status updated'));
});