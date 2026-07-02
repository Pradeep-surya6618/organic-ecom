const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/admin/analytics.controller');
const { protect } = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/role.middleware');

router.get('/sales-chart', protect, requireAdmin, analyticsController.getSalesChart);
router.get('/top-products', protect, requireAdmin, analyticsController.getTopProducts);
router.get('/order-stats', protect, requireAdmin, analyticsController.getOrderStats);

module.exports = router;