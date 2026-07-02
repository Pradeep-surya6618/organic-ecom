const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// Public — submit a contact message
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Name, email and message are required' });
        }
        const doc = await Contact.create({ name, email, subject, message });
        res.status(201).json({ success: true, data: { _id: doc._id }, message: 'Message received. We will get back to you soon.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin — list submitted messages
router.get('/', protect, requireAdmin, async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 }).limit(200);
        const unread = await Contact.countDocuments({ isRead: false });
        res.json({ success: true, data: messages, unread, message: 'Contact messages fetched' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin — mark a message read/unread
router.patch('/:id/read', protect, requireAdmin, async (req, res) => {
    try {
        const isRead = req.body.isRead != null ? !!req.body.isRead : true;
        const doc = await Contact.findByIdAndUpdate(req.params.id, { isRead }, { new: true });
        if (!doc) return res.status(404).json({ success: false, message: 'Message not found' });
        res.json({ success: true, data: doc, message: 'Message updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin — delete a message
router.delete('/:id', protect, requireAdmin, async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: null, message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
