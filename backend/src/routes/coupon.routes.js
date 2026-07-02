const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.get('/', protect, couponController.getCoupons);
router.post('/validate', protect, couponController.validateCoupon);
router.post('/', protect, requireAdmin, couponController.createCoupon);
router.put('/:id', protect, requireAdmin, couponController.updateCoupon);
router.delete('/:id', protect, requireAdmin, couponController.deleteCoupon);

module.exports = router;