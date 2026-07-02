const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/admin/settings.controller');
const { protect } = require('../../middleware/auth.middleware');
const { requireSuperAdmin } = require('../../middleware/role.middleware');

router.get('/', protect, requireSuperAdmin, settingsController.getSettings);
router.get('/:key', protect, requireSuperAdmin, settingsController.getSetting);
router.put('/', protect, requireSuperAdmin, settingsController.updateSetting);
router.delete('/:key', protect, requireSuperAdmin, settingsController.deleteSetting);

module.exports = router;