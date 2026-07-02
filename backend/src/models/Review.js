const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    comment: { type: String, required: true },
    images: [{
        data: Buffer,
        contentType: String
    }],
    isVerifiedPurchase: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

reviewSchema.index({ product: 1, isActive: 1 });
reviewSchema.index({ user: 1 });

module.exports = mongoose.model('Review', reviewSchema);