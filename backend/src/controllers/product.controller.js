const productService = require('../services/product.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

exports.createProduct = asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.body);
    res.status(201).json(new ApiResponse(201, product, 'Product created'));
});

exports.getProducts = asyncHandler(async (req, res) => {
    const result = await productService.getProducts(req.query);
    res.json(new ApiResponse(200, result, 'Products fetched'));
});

exports.getProduct = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    res.json(new ApiResponse(200, product, 'Product fetched'));
});

exports.updateProduct = asyncHandler(async (req, res) => {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json(new ApiResponse(200, product, 'Product updated'));
});

exports.deleteProduct = asyncHandler(async (req, res) => {
    await productService.deleteProduct(req.params.id);
    res.json(new ApiResponse(200, null, 'Product deleted'));
});

exports.getFeatured = asyncHandler(async (req, res) => {
    const products = await productService.getFeaturedProducts();
    res.json(new ApiResponse(200, products, 'Featured products fetched'));
});