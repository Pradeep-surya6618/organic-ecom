const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.get('/all', protect, requireAdmin, userController.getAllUsers);
router.patch('/:id/toggle-status', protect, requireAdmin, userController.toggleUserStatus);

module.exports = router;