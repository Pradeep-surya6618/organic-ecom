const Category = require('../models/Category');
const Product = require('../models/Product');
const activityService = require('../services/activity.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const slugify = (str) => String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const logCat = (req, action, category) => activityService.log({
    action,
    type: 'catalog',
    actor: req.user?.fullName || req.user?.name || 'Admin',
    actorId: req.user?._id,
    role: req.user?.role || 'admin',
    meta: { categoryId: String(category?._id || category || '') }
});

// Public — active categories only
exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(new ApiResponse(200, categories, 'Categories fetched'));
});

// Admin — every category, each with how many products are linked to it
exports.getAdminCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ order: 1, createdAt: -1 });
    const counts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    const map = {};
    counts.forEach((c) => { map[String(c._id)] = c.count; });
    const withCounts = categories.map((c) => ({ ...c.toObject(), productCount: map[String(c._id)] || 0 }));
    res.json(new ApiResponse(200, withCounts, 'Categories fetched'));
});

exports.getCategory = asyncHandler(async (req, res) => {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json(new ApiResponse(200, category, 'Category fetched'));
});

exports.createCategory = asyncHandler(async (req, res) => {
    const { name, description, order } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Category name is required' });
    const slug = slugify(name);
    const exists = await Category.findOne({ $or: [{ name: name.trim() }, { slug }] });
    if (exists) return res.status(400).json({ success: false, message: 'A category with this name already exists' });
    const category = await Category.create({ name: name.trim(), slug, description: description || '', order: Number(order) || 0 });
    logCat(req, `Category "${category.name}" created`, category);
    res.status(201).json(new ApiResponse(201, category, 'Category created'));
});

exports.updateCategory = asyncHandler(async (req, res) => {
    const { name, description, order } = req.body;
    const update = {};
    if (name != null) { update.name = name.trim(); update.slug = slugify(name); }
    if (description != null) update.description = description;
    if (order != null) update.order = Number(order) || 0;

    if (update.name) {
        const clash = await Category.findOne({ _id: { $ne: req.params.id }, $or: [{ name: update.name }, { slug: update.slug }] });
        if (clash) return res.status(400).json({ success: false, message: 'A category with this name already exists' });
    }

    const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    logCat(req, `Category "${category.name}" updated`, category);
    res.json(new ApiResponse(200, category, 'Category updated'));
});

exports.deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    // Block deletion while products are still linked to this category.
    const linked = await Product.countDocuments({ category: req.params.id });
    if (linked > 0) {
        return res.status(400).json({
            success: false,
            message: `Cannot delete "${category.name}" — ${linked} product${linked > 1 ? 's are' : ' is'} linked to it. Reassign or remove those products first.`,
            productCount: linked
        });
    }

    await Category.findByIdAndDelete(req.params.id);
    logCat(req, `Category "${category.name}" deleted`, req.params.id);
    res.json(new ApiResponse(200, null, 'Category deleted'));
});
