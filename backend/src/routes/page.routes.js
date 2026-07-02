const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// Public — list all pages (for the admin list + footer)
router.get('/', async (req, res) => {
    try {
        const pages = await Page.find().sort({ slug: 1 });
        res.json({ success: true, data: pages, message: 'Pages fetched' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Public — get one page by slug
router.get('/:slug', async (req, res) => {
    try {
        const page = await Page.findOne({ slug: req.params.slug.toLowerCase() });
        if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
        res.json({ success: true, data: page, message: 'Page fetched' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Admin — create a page
router.post('/', protect, requireAdmin, async (req, res) => {
    try {
        const { slug, title, body, imageUrl } = req.body;
        if (!slug || !title) return res.status(400).json({ success: false, message: 'Slug and title are required' });
        const page = await Page.create({ slug: String(slug).toLowerCase(), title, body, imageUrl });
        res.status(201).json({ success: true, data: page, message: 'Page created' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Admin — update (upsert) a page by slug
router.put('/:slug', protect, requireAdmin, async (req, res) => {
    try {
        const { title, body, imageUrl } = req.body;
        const update = {};
        if (title != null) update.title = title;
        if (body != null) update.body = body;
        if (imageUrl !== undefined) update.imageUrl = imageUrl;
        const page = await Page.findOneAndUpdate(
            { slug: req.params.slug.toLowerCase() },
            update,
            { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
        );
        res.json({ success: true, data: page, message: 'Page updated' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Admin — delete a page
router.delete('/:slug', protect, requireAdmin, async (req, res) => {
    try {
        await Page.findOneAndDelete({ slug: req.params.slug.toLowerCase() });
        res.json({ success: true, data: null, message: 'Page deleted' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;
