const Blog = require('../../models/Blog');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

exports.getAllBlogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const blogs = await Blog.find().populate('author', 'fullName').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await Blog.countDocuments();
    res.json(new ApiResponse(200, { blogs, total, page: parseInt(page), pages: Math.ceil(total / limit) }, 'Blogs fetched'));
});

exports.publishBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findByIdAndUpdate(req.params.id, { isPublished: true, publishedAt: new Date() }, { new: true });
    res.json(new ApiResponse(200, blog, 'Blog published'));
});

exports.unpublishBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findByIdAndUpdate(req.params.id, { isPublished: false }, { new: true });
    res.json(new ApiResponse(200, blog, 'Blog unpublished'));
});