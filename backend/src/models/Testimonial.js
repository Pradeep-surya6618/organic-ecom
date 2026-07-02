const mongoose = require('mongoose');

// General storefront review / testimonial (not tied to a product or order).
const testimonialSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    author: { type: String, required: true },
    userEmail: { type: String },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    text: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
