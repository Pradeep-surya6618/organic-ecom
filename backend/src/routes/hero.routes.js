const express = require('express');
const router = express.Router();
const StoreSetting = require('../models/StoreSetting');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

const KEY = 'home_hero';

// Public — read the home hero config
router.get('/', async (req, res) => {
    try {
        const s = await StoreSetting.findOne({ key: KEY });
        res.json({ success: true, data: s ? s.value : null, message: 'Hero fetched' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Admin — update the home hero config
router.put('/', protect, requireAdmin, async (req, res) => {
    try {
        const s = await StoreSetting.findOneAndUpdate(
            { key: KEY },
            { key: KEY, value: req.body, group: 'home', description: 'Homepage hero section' },
            { new: true, upsert: true }
        );
        res.json({ success: true, data: s.value, message: 'Hero updated' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;
