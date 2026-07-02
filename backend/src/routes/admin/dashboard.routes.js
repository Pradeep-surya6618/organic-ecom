const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboard.controller');
const { protect } = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/role.middleware');

router.get('/stats', protect, requireAdmin, dashboardController.getStats);
router.get('/recent-orders', protect, requireAdmin, dashboardController.getRecentOrders);
router.get('/recent-users', protect, requireAdmin, dashboardController.getRecentUsers);

module.exports = router;