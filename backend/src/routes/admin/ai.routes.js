const express = require('express');
const router = express.Router();
const adminAIController = require('../../controllers/admin/adminAI.controller');
const { protect } = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/role.middleware');

router.post('/chat', protect, requireAdmin, adminAIController.chat);
router.post('/execute', protect, requireAdmin, adminAIController.execute);
router.post('/product-description', protect, requireAdmin, adminAIController.generateProductDescription);
router.post('/draft-reply', protect, requireAdmin, adminAIController.draftReply);

module.exports = router;
