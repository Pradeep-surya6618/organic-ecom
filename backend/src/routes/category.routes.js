const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.get('/', categoryController.getCategories);
router.get('/admin/all', protect, requireAdmin, categoryController.getAdminCategories);
router.get('/:slug', categoryController.getCategory);
router.post('/', protect, requireAdmin, categoryController.createCategory);
router.put('/:id', protect, requireAdmin, categoryController.updateCategory);
router.delete('/:id', protect, requireAdmin, categoryController.deleteCategory);

module.exports = router;