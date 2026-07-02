const express = require('express');
const router = express.Router();
const reviewAdminController = require('../../controllers/admin/reviewAdmin.controller');
const { protect } = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/role.middleware');

router.get('/', protect, requireAdmin, reviewAdminController.getAllReviews);
router.patch('/:id/toggle-status', protect, requireAdmin, reviewAdminController.toggleReviewStatus);

module.exports = router;