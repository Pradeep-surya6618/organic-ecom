const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.get('/', blogController.getBlogs);
router.get('/:slug', blogController.getBlog);
router.post('/', protect, requireAdmin, blogController.createBlog);
router.put('/:id', protect, requireAdmin, blogController.updateBlog);
router.delete('/:id', protect, requireAdmin, blogController.deleteBlog);

module.exports = router;