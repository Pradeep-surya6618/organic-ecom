const Wishlist = require('../models/Wishlist');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

exports.getWishlist = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    if (!wishlist) return res.json(new ApiResponse(200, { products: [] }, 'Wishlist fetched'));
    res.json(new ApiResponse(200, wishlist, 'Wishlist fetched'));
});

exports.addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });
    if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
    }
    res.json(new ApiResponse(200, wishlist, 'Added to wishlist'));
});

exports.removeFromWishlist = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findOneAndUpdate(
        { user: req.user._id },
        { $pull: { products: req.params.productId } },
        { new: true }
    );
    res.json(new ApiResponse(200, wishlist, 'Removed from wishlist'));
});