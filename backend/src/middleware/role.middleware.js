const ApiError = require('../utils/ApiError');

exports.requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        throw new ApiError(403, 'Admin access required');
    }
    next();
};

exports.requireSuperAdmin = (req, res, next) => {
    if (req.user.role !== 'superadmin') {
        throw new ApiError(403, 'Super admin access required');
    }
    next();
};

exports.requireDeliveryPartner = (req, res, next) => {
    if (req.user.role !== 'delivery_partner' && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        throw new ApiError(403, 'Delivery partner access required');
    }
    next();
};