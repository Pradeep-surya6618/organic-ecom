const multer = require('multer');
const ApiError = require('../utils/ApiError');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Only image files are allowed'), false);
    }
};

exports.uploadSingle = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }).single('image');
exports.uploadMultiple = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }).array('images', 5);