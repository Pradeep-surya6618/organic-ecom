exports.ROLES = {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
    SUPERADMIN: 'superadmin',
    DELIVERY_PARTNER: 'delivery_partner'
};

exports.ORDER_STATUS = ['pending', 'confirmed', 'processing', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];
exports.PAYMENT_STATUS = ['pending', 'completed', 'failed', 'refunded'];
exports.PAYMENT_METHODS = ['cod', 'online'];
exports.ADDRESS_TYPES = ['home', 'work', 'other'];
exports.COUPON_TYPES = ['percentage', 'fixed'];
exports.DELIVERY_STATUS = ['assigned', 'picked_up', 'in_transit', 'delivered', 'failed'];