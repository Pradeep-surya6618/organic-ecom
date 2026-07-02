const mongoose = require('mongoose');

const ORDER_STATUS = ['pending', 'confirmed', 'processing', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];
const PAYMENT_STATUS = ['pending', 'completed', 'failed', 'refunded'];

const orderItemSchema = new mongoose.Schema({
    product: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String }
});

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [orderItemSchema],
    shippingAddress: {
        fullName: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        pincode: String,
        landmark: String
    },
    pricing: {
        subtotal: { type: Number, required: true },
        shipping: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        total: { type: Number, required: true }
    },
    status: { type: String, enum: ORDER_STATUS, default: 'pending' },
    paymentStatus: { type: String, enum: PAYMENT_STATUS, default: 'pending' },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
    payment: {
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
        amount: Number,
        paidAt: Date
    },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    estimatedDelivery: Date,
    actualDelivery: Date,
    notes: String,
    cancellationReason: String
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        const date = new Date();
        const prefix = 'ORD' + date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0');
        const count = await mongoose.model('Order').countDocuments({ orderNumber: new RegExp('^' + prefix) });
        this.orderNumber = prefix + String(count + 1).padStart(5, '0');
    }
    next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);