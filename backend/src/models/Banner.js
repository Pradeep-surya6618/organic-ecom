const mongoose = require('mongoose');

// Promotional banners / lifestyle tips shown in the Content Manager.
const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['Active Banner', 'Lifestyle Tip'], default: 'Active Banner' },
    location: { type: String, default: '' },
    tag: { type: String, default: '' },
    date: { type: String, default: '' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
