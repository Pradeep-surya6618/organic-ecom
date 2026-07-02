const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// Public — active banners
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
        res.json({ success: true, data: banners, message: 'Banners fetched' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Admin — all banners
router.get('/admin/all', protect, requireAdmin, async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        res.json({ success: true, data: banners, message: 'All banners fetched' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/', protect, requireAdmin, async (req, res) => {
    try {
        if (!req.body.title) return res.status(400).json({ success: false, message: 'Title is required' });
        const banner = await Banner.create(req.body);
        res.status(201).json({ success: true, data: banner, message: 'Banner created' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.put('/:id', protect, requireAdmin, async (req, res) => {
    try {
        const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
        res.json({ success: true, data: banner, message: 'Banner updated' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.delete('/:id', protect, requireAdmin, async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: null, message: 'Banner deleted' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;
