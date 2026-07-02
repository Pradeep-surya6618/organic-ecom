const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

router.post('/', optionalAuth, orderController.createOrder);
router.get('/', protect, orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.get('/:id/invoice', orderController.downloadInvoice);
router.patch('/:id/cancel', protect, orderController.cancelOrder);

module.exports = router;