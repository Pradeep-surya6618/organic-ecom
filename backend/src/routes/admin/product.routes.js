const express = require('express');
const router = express.Router();
const productAdminController = require('../../controllers/admin/productAdmin.controller');
const { protect } = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/role.middleware');

router.get('/', protect, requireAdmin, productAdminController.getAllProducts);
router.patch('/:id/toggle-status', protect, requireAdmin, productAdminController.toggleProductStatus);

module.exports = router;