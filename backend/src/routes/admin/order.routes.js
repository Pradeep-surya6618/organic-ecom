const express = require('express');
const router = express.Router();
const orderAdminController = require('../../controllers/admin/orderAdmin.controller');
const { protect } = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/role.middleware');

router.get('/', protect, requireAdmin, orderAdminController.getAllOrders);
router.patch('/:id/status', protect, requireAdmin, orderAdminController.updateOrderStatus);
router.patch('/:id/assign-delivery', protect, requireAdmin, orderAdminController.assignDeliveryPartner);

module.exports = router;