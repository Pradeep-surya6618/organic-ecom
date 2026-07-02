const Blog = require('../models/Blog');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const slugify = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

exports.createBlog = asyncHandler(async (req, res) => {
    const data = { ...req.body, author: req.user._id };
    if (!data.slug && data.title) data.slug = `${slugify(data.title)}-${Date.now().toString(36)}`;
    if (data.isPublished && !data.publishedAt) data.publishedAt = new Date();
    const blog = await Blog.create(data);
    res.status(201).json(new ApiResponse(201, blog, 'Blog created'));
});

exports.getBlogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, category } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    const blogs = await Blog.find(filter).populate('author', 'fullName').sort({ publishedAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await Blog.countDocuments(filter);
    res.json(new ApiResponse(200, { blogs, total, page: parseInt(page), pages: Math.ceil(total / limit) }, 'Blogs fetched'));
});

exports.getBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true }).populate('author', 'fullName');
    if (!blog) throw new ApiError(404, 'Blog not found');
    blog.views += 1; await blog.save();
    res.json(new ApiResponse(200, blog, 'Blog fetched'));
});

exports.updateBlog = asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.isPublished && !data.publishedAt) data.publishedAt = new Date();
    const blog = await Blog.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(new ApiResponse(200, blog, 'Blog updated'));
});

exports.deleteBlog = asyncHandler(async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    res.json(new ApiResponse(200, null, 'Blog deleted'));
});