const analyticsService = require('../../services/analytics.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

exports.getStats = asyncHandler(async (req, res) => {
    const stats = await analyticsService.getDashboardStats();
    res.json(new ApiResponse(200, stats, 'Dashboard stats fetched'));
});

exports.getRecentOrders = asyncHandler(async (req, res) => {
    const Order = require('../../models/Order');
    const orders = await Order.find().populate('user', 'fullName email').sort({ createdAt: -1 }).limit(10);
    res.json(new ApiResponse(200, orders, 'Recent orders fetched'));
});

exports.getRecentUsers = asyncHandler(async (req, res) => {
    const User = require('../../models/User');
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password -otp').sort({ createdAt: -1 }).limit(10);
    res.json(new ApiResponse(200, users, 'Recent users fetched'));
});