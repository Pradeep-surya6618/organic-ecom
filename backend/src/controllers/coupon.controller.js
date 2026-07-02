const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

exports.createCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(new ApiResponse(201, coupon, 'Coupon created'));
});

exports.getCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({ isActive: true, endDate: { $gte: new Date() } });
    res.json(new ApiResponse(200, coupons, 'Coupons fetched'));
});

exports.validateCoupon = asyncHandler(async (req, res) => {
    const { code, orderValue } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) throw new ApiError(404, 'Invalid coupon');
    if (coupon.endDate < new Date()) throw new ApiError(400, 'Coupon expired');
    if (coupon.startDate > new Date()) throw new ApiError(400, 'Coupon not active yet');
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) throw new ApiError(400, 'Coupon usage limit reached');
    if (orderValue < coupon.minOrderValue) throw new ApiError(400, `Minimum order value Rs.${coupon.minOrderValue} required`);
    if (coupon.usedBy.includes(req.user._id)) throw new ApiError(400, 'Coupon already used');

    let discount = coupon.discountType === 'percentage'
        ? (orderValue * coupon.discountValue) / 100
        : coupon.discountValue;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);

    res.json(new ApiResponse(200, { coupon, discount }, 'Coupon valid'));
});

exports.updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(new ApiResponse(200, coupon, 'Coupon updated'));
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
    await Coupon.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json(new ApiResponse(200, null, 'Coupon deleted'));
});