const userService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

exports.getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user._id);
    res.json(new ApiResponse(200, user, 'Profile fetched'));
});

exports.updateProfile = asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user._id, req.body);
    res.json(new ApiResponse(200, user, 'Profile updated'));
});

exports.getAllUsers = asyncHandler(async (req, res) => {
    const result = await userService.getAllUsers(req.query);
    res.json(new ApiResponse(200, result, 'Users fetched'));
});

exports.toggleUserStatus = asyncHandler(async (req, res) => {
    const user = await userService.toggleUserStatus(req.params.id);
    res.json(new ApiResponse(200, user, 'User status updated'));
});