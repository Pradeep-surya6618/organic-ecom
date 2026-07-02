const mongoose = require('mongoose');

// Thumbs up/down feedback on AI chat answers — collected for tuning.
const chatFeedbackSchema = new mongoose.Schema({
    rating: { type: String, enum: ['up', 'down'], required: true },
    userMessage: { type: String, default: '' },
    botMessage: { type: String, default: '' },
    comment: { type: String, default: '' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

chatFeedbackSchema.index({ rating: 1, createdAt: -1 });

module.exports = mongoose.model('ChatFeedback', chatFeedbackSchema);
