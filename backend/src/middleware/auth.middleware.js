const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * verifyToken
 * Reads JWT from HTTP-only cookie or Authorization Bearer header, validates it, and mounts user object to request.
 */
const verifyToken = async (req, res, next) => {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Check httpOnly cookie
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(new ApiError('Access denied. No authentication token provided.', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars-long');
        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new ApiError('The user belonging to this token no longer exists.', 401));
        }

        req.user = user;
        next();
    } catch (error) {
        return next(new ApiError('Invalid or expired authentication token.', 401));
    }
};

/**
 * requireRole
 * Limits endpoint route access to specific roles.
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError('Authentication credentials required.', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new ApiError('Access forbidden. Insufficient permissions.', 403));
        }
        next();
    };
};

const optionalAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars-long');
        const user = await User.findById(decoded.id);
        if (user) req.user = user;
    } catch (error) {
        // invalid token, just continue as guest
    }
    next();
};

module.exports = {
    verifyToken,
    protect: verifyToken,
    requireRole,
    optionalAuth
};