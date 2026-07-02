const cartService = require('../services/cart.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

exports.getCart = asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.user._id);
    res.json(new ApiResponse(200, cart, 'Cart fetched'));
});

exports.addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(req.user._id, productId, quantity || 1);
    res.json(new ApiResponse(200, cart, 'Added to cart'));
});

exports.updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const cart = await cartService.updateCartItem(req.user._id, req.params.productId, quantity);
    res.json(new ApiResponse(200, cart, 'Cart updated'));
});

exports.removeFromCart = asyncHandler(async (req, res) => {
    const cart = await cartService.removeFromCart(req.user._id, req.params.productId);
    res.json(new ApiResponse(200, cart, 'Removed from cart'));
});

exports.clearCart = asyncHandler(async (req, res) => {
    const cart = await cartService.clearCart(req.user._id);
    res.json(new ApiResponse(200, cart, 'Cart cleared'));
});