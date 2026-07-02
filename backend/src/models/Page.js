const mongoose = require('mongoose');

// Editable static/content page (About, FAQ, Shipping, Returns, Privacy, Terms, …)
const pageSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },      // plain text / simple markup
    imageUrl: { type: String },               // optional hero image (URL or base64)
}, { timestamps: true });

module.exports = mongoose.model('Page', pageSchema);
