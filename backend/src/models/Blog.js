const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true, lowercase: true },
    content: { type: String, default: '' },
    excerpt: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coverImage: {
        data: Buffer,
        contentType: String,
        filename: String
    },
    imageUrl: { type: String },   // cover image URL / base64 (admin uploads)
    category: { type: String },
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

blogSchema.index({ slug: 1 });
blogSchema.index({ isPublished: 1, publishedAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);