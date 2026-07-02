const Review = require('../models/Review');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

exports.createReview = asyncHandler(async (req, res) => {
    const { productId, orderId, rating, comment, title } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id, status: 'delivered' });
    if (!order) throw new ApiError(400, 'Can only review delivered orders');

    const review = await Review.create({
        user: req.user._id, product: productId, order: orderId,
        rating, comment, title, isVerifiedPurchase: true
    });
    res.status(201).json(new ApiResponse(201, review, 'Review created'));
});

exports.getProductReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ product: req.params.productId, isActive: true })
        .populate('user', 'fullName').sort({ createdAt: -1 });
    res.json(new ApiResponse(200, reviews, 'Reviews fetched'));
});

exports.getMyReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ user: req.user._id }).populate('product', 'name images');
    res.json(new ApiResponse(200, reviews, 'My reviews fetched'));
});

exports.updateReview = asyncHandler(async (req, res) => {
    const review = await Review.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body, { new: true }
    );
    res.json(new ApiResponse(200, review, 'Review updated'));
});

exports.deleteReview = asyncHandler(async (req, res) => {
    await Review.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isActive: false });
    res.json(new ApiResponse(200, null, 'Review deleted'));
});