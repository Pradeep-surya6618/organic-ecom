const { body } = require('express-validator');

exports.updateProfileValidation = [
    body('fullName').optional().trim().isLength({ max: 50 }).withMessage('Name max 50 chars')
];