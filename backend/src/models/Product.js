const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    images: [{
        data: Buffer,
        contentType: String,
        filename: String
    }],
    // Main image (URL or base64 data-URL) — used on cards/lists everywhere.
    imageUrl: { type: String },
    // Full gallery (up to 3 images incl. the main) — used on the product detail page.
    imageUrls: [{ type: String }],
    emoji: { type: String },
    // One promotional badge shown on the card: 'Best Seller' | 'Sale' | 'Popular' | 'Premium' | 'Seasonal'
    badge: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: String },
    stock: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, default: 'piece' },
    weight: { type: String },
    sku: { type: String, unique: true, sparse: true },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    ratings: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    nutritionInfo: {
        calories: Number,
        protein: String,
        carbs: String,
        fat: String,
        fiber: String
    },
    origin: { type: String },
    shelfLife: { type: String },
    organic: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);