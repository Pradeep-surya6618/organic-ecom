const mongoose = require('mongoose');

const ACTIVITY_TYPES = ['order', 'review', 'product', 'catalog', 'delivery', 'payment', 'user', 'auth', 'system'];

const activityLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    type: { type: String, enum: ACTIVITY_TYPES, default: 'system' },
    actor: { type: String, default: 'System' },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: 'system' },
    meta: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
