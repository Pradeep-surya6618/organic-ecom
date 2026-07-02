const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// Public — active recipes
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find({ isActive: true }).sort({ createdAt: -1 });
        res.json({ success: true, data: recipes, message: 'Recipes fetched' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Admin — all recipes
router.get('/admin/all', protect, requireAdmin, async (req, res) => {
    try {
        const recipes = await Recipe.find().sort({ createdAt: -1 });
        res.json({ success: true, data: recipes, message: 'All recipes fetched' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Public — single recipe
router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
        res.json({ success: true, data: recipe, message: 'Recipe fetched' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Admin — create
router.post('/', protect, requireAdmin, async (req, res) => {
    try {
        if (!req.body.title) return res.status(400).json({ success: false, message: 'Title is required' });
        const recipe = await Recipe.create(req.body);
        res.status(201).json({ success: true, data: recipe, message: 'Recipe created' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Admin — update
router.put('/:id', protect, requireAdmin, async (req, res) => {
    try {
        const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
        res.json({ success: true, data: recipe, message: 'Recipe updated' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Admin — delete
router.delete('/:id', protect, requireAdmin, async (req, res) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: null, message: 'Recipe deleted' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;
