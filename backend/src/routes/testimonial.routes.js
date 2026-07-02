const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const activityService = require('../services/activity.service');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// Public list — approved reviews + (if signed in) the requester's own (any status)
router.get('/', optionalAuth, async (req, res) => {
    try {
        const or = [{ status: 'approved' }];
        if (req.user) or.push({ user: req.user._id });
        const reviews = await Testimonial.find({ $or: or }).sort({ createdAt: -1 }).limit(200);
        res.json({ success: true, data: reviews, message: 'Reviews fetched' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Create — author & email derived from the signed-in account
router.post('/', protect, async (req, res) => {
    try {
        const { rating, text } = req.body;
        if (!text || !text.trim()) return res.status(400).json({ success: false, message: 'Review text is required' });
        const doc = await Testimonial.create({
            user: req.user._id,
            author: req.user.name || req.user.fullName || 'Customer',
            userEmail: req.user.email,
            rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
            text: text.trim(),
            status: 'pending',
        });
        res.status(201).json({ success: true, data: doc, message: 'Review submitted for moderation' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update own review
router.put('/:id', protect, async (req, res) => {
    try {
        const { rating, text } = req.body;
        const update = {};
        if (rating != null) update.rating = Math.min(5, Math.max(1, parseInt(rating)));
        if (text != null) update.text = String(text).trim();
        const doc = await Testimonial.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, update, { new: true });
        if (!doc) return res.status(404).json({ success: false, message: 'Review not found' });
        res.json({ success: true, data: doc, message: 'Review updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete own review
router.delete('/:id', protect, async (req, res) => {
    try {
        await Testimonial.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ success: true, data: null, message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Admin moderation ──
router.get('/admin/all', protect, requireAdmin, async (req, res) => {
    try {
        const reviews = await Testimonial.find().sort({ createdAt: -1 }).limit(500);
        res.json({ success: true, data: reviews, message: 'All reviews fetched' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/admin/:id/approve', protect, requireAdmin, async (req, res) => {
    try {
        const doc = await Testimonial.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
        activityService.log({
            action: `Approved review by ${doc?.author || 'a customer'}`,
            type: 'review',
            actor: req.user?.fullName || req.user?.name || 'Admin',
            actorId: req.user?._id,
            role: req.user?.role || 'admin',
            meta: { testimonialId: req.params.id }
        });
        res.json({ success: true, data: doc, message: 'Review approved' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/admin/:id', protect, requireAdmin, async (req, res) => {
    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        activityService.log({
            action: 'Deleted a customer review',
            type: 'review',
            actor: req.user?.fullName || req.user?.name || 'Admin',
            actorId: req.user?._id,
            role: req.user?.role || 'admin',
            meta: { testimonialId: req.params.id }
        });
        res.json({ success: true, data: null, message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
