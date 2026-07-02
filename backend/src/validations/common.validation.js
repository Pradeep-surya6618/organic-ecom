const { param } = require('express-validator');

exports.mongoIdValidation = [
    param('id').isMongoId().withMessage('Invalid ID format')
];