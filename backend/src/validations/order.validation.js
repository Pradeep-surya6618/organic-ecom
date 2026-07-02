const { body } = require('express-validator');

exports.createOrderValidation = [
    body('shippingAddress').isObject().withMessage('Shipping address required'),
    body('shippingAddress.fullName').notEmpty().withMessage('Full name required'),
    body('shippingAddress.phone').notEmpty().withMessage('Phone required'),
    body('shippingAddress.address').notEmpty().withMessage('Address required'),
    body('shippingAddress.city').notEmpty().withMessage('City required'),
    body('shippingAddress.state').notEmpty().withMessage('State required'),
    body('shippingAddress.pincode').notEmpty().withMessage('Pincode required')
];