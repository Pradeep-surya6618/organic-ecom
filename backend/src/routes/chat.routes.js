const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

// Public — works for guests and (with context) signed-in customers.
router.post('/', optionalAuth, chatController.chat);
router.post('/stream', optionalAuth, chatController.chatStream);
router.post('/feedback', optionalAuth, chatController.submitFeedback);
router.get('/health', chatController.health);
router.post('/clear', optionalAuth, chatController.clearHistory);

module.exports = router;
