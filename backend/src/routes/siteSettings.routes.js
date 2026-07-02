const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/siteSettings.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.get('/', ctrl.getContactInfo);                       // public read
router.put('/', protect, requireAdmin, ctrl.updateContactInfo);

router.get('/ad-bar', ctrl.getAdBar);                       // public read
router.put('/ad-bar', protect, requireAdmin, ctrl.updateAdBar);

module.exports = router;
