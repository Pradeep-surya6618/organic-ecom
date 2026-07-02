const express = require('express');
const router = express.Router();
const deliveryController = require('../../controllers/admin/delivery.controller');
const { protect } = require('../../middleware/auth.middleware');
const { requireDeliveryPartner } = require('../../middleware/role.middleware');

router.get('/assigned', protect, requireDeliveryPartner, deliveryController.getAssignedOrders);
router.patch('/:id/location', protect, requireDeliveryPartner, deliveryController.updateLocation);
router.patch('/:id/status', protect, requireDeliveryPartner, deliveryController.updateDeliveryStatus);

module.exports = router;