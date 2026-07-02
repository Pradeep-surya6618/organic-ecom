const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

class ProductService {
    async createProduct(data) {
        return await Product.create(data);
    }

    async getProducts(query = {}) {
        const { page = 1, limit = 12, category, search, minPrice, maxPrice, sort = '-createdAt', isFeatured } = query;
        const filter = { isActive: true };
        if (category) filter.category = category;
        if (search) filter.$text = { $search: search };
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        if (isFeatured === 'true') filter.isFeatured = true;

        const products = await Product.find(filter).select('-imageUrls -images').populate('category', 'name slug').skip((page - 1) * limit).limit(parseInt(limit)).sort(sort);
        const total = await Product.countDocuments(filter);
        return { products, total, page: parseInt(page), pages: Math.ceil(total / limit) };
    }

    async getProductById(id) {
        const product = await Product.findById(id).populate('category', 'name slug');
        if (!product) throw new ApiError(404, 'Product not found');
        return product;
    }

    async updateProduct(id, data) {
        const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        if (!product) throw new ApiError(404, 'Product not found');
        return product;
    }

    async deleteProduct(id) {
        const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!product) throw new ApiError(404, 'Product not found');
        return product;
    }

    async getFeaturedProducts() {
        return await Product.find({ isFeatured: true, isActive: true }).populate('category', 'name slug').limit(8);
    }
}
module.exports = new ProductService();