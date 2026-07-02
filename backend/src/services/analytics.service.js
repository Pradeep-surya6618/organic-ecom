const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

class AnalyticsService {
    async getDashboardStats() {
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
        const totalProducts = await Product.countDocuments({ isActive: true });
        const totalRevenue = await Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const ordersToday = await Order.countDocuments({ createdAt: { $gte: today } });
        const revenueToday = await Order.aggregate([{ $match: { createdAt: { $gte: today }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]);

        return {
            totalOrders,
            totalUsers,
            totalProducts,
            totalRevenue: totalRevenue[0]?.total || 0,
            ordersToday,
            revenueToday: revenueToday[0]?.total || 0
        };
    }

    async getSalesChart(days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const data = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, sales: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        return data;
    }

    async getTopProducts(limit = 10) {
        const products = await Order.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
            { $sort: { totalSold: -1 } },
            { $limit: parseInt(limit) }
        ]);
        return products;
    }
}
module.exports = new AnalyticsService();