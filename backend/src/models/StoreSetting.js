const mongoose = require('mongoose');

const storeSettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    group: { type: String, default: 'general' },
    description: String
}, { timestamps: true });

module.exports = mongoose.model('StoreSetting', storeSettingSchema);