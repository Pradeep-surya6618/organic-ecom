const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String },
    prepTime: { type: String, default: '' },     // e.g. "10 mins"
    servings: { type: String, default: '' },      // e.g. "2"
    calories: { type: String, default: '' },      // e.g. "320 kcal"
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    ingredients: [{
        name: { type: String, required: true },   // matched to a store product by name
        note: { type: String },
    }],
    steps: [{ type: String }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
