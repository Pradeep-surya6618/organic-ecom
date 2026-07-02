const { body } = require('express-validator');

exports.createReviewValidation = [
    body('productId').notEmpty().withMessage('Product ID required'),
    body('orderId').notEmpty().withMessage('Order ID required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating 1-5 required'),
    body('comment').trim().notEmpty().withMessage('Comment required')
];