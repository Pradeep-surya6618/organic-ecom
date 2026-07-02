const express = require('express');
const router = express.Router();
const blogAdminController = require('../../controllers/admin/blogAdmin.controller');
const { protect } = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/role.middleware');

router.get('/', protect, requireAdmin, blogAdminController.getAllBlogs);
router.patch('/:id/publish', protect, requireAdmin, blogAdminController.publishBlog);
router.patch('/:id/unpublish', protect, requireAdmin, blogAdminController.unpublishBlog);

module.exports = router;