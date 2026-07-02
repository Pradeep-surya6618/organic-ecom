const { body } = require('express-validator');

exports.createProductValidation = [
    body('name').trim().notEmpty().withMessage('Product name required'),
    body('description').trim().notEmpty().withMessage('Description required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
    body('category').notEmpty().withMessage('Category required'),
    body('stock').isInt({ min: 0 }).withMessage('Valid stock required')
];