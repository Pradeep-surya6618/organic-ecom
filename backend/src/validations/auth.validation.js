const { body } = require('express-validator');

exports.registerValidation = [
    body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 50 }).withMessage('Name max 50 chars'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ characters')
];

exports.loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required')
];

exports.otpValidation = [
    body('email').isEmail().withMessage('Valid email required'),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('6-digit OTP required')
];

exports.forgotPasswordValidation = [
    body('email').isEmail().withMessage('Valid email required')
];

exports.resetPasswordValidation = [
    body('resetToken').notEmpty().withMessage('Reset token required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be 6+ characters')
];