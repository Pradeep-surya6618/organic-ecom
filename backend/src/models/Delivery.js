const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['assigned', 'picked_up', 'in_transit', 'delivered', 'failed'], default: 'assigned' },
    pickupTime: Date,
    deliveryTime: Date,
    currentLocation: {
        lat: Number,
        lng: Number,
        updatedAt: Date
    },
    notes: String,
    otp: { type: String },
    otpVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);