const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

class CartService {
    async getCart(userId) {
        let cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }
        return cart;
    }

    async addToCart(userId, productId, quantity) {
        const product = await Product.findById(productId);
        if (!product || !product.isActive) throw new ApiError(404, 'Product not found');
        if (product.stock < quantity) throw new ApiError(400, 'Insufficient stock');

        let cart = await Cart.findOne({ user: userId });
        if (!cart) cart = new Cart({ user: userId, items: [] });

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
            cart.items[itemIndex].price = product.price;
        } else {
            cart.items.push({ product: productId, quantity, price: product.price });
        }
        await cart.save();
        return await cart.populate('items.product');
    }

    async updateCartItem(userId, productId, quantity) {
        if (quantity < 1) return this.removeFromCart(userId, productId);
        const cart = await Cart.findOne({ user: userId });
        if (!cart) throw new ApiError(404, 'Cart not found');
        const item = cart.items.find(item => item.product.toString() === productId);
        if (!item) throw new ApiError(404, 'Item not in cart');
        item.quantity = quantity;
        await cart.save();
        return await cart.populate('items.product');
    }

    async removeFromCart(userId, productId) {
        const cart = await Cart.findOneAndUpdate(
            { user: userId },
            { $pull: { items: { product: productId } } },
            { new: true }
        ).populate('items.product');
        return cart;
    }

    async clearCart(userId) {
        const cart = await Cart.findOneAndUpdate({ user: userId }, { items: [], coupon: null, couponDiscount: 0 }, { new: true });
        return cart;
    }
}
module.exports = new CartService();