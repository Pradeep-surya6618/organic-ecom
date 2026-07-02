const express = require('express');
const router = express.Router();
const activityController = require('../../controllers/admin/activity.controller');
const { protect } = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/role.middleware');

router.get('/', protect, requireAdmin, activityController.getActivities);

module.exports = router;
