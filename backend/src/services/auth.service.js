const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const { hashToken } = require('../utils/helpers');
const emailService = require('./email.service');

class AuthService {
    async register({ fullName, email, password }) {
        const existing = await User.findOne({ email });
        if (existing) throw new ApiError(400, 'Email already registered');

        const user = await User.create({ fullName, email, password, isVerified: false });
        const otpCode = user.generateOTP('registration');
        await user.save({ validateBeforeSave: false });
        await emailService.sendOTPEmail(email, otpCode, 'registration');
        return { email };
    }

    async verifyRegistrationOTP(email, otpCode) {
        const user = await User.findOne({ email }).select('+otp');
        if (!user) throw new ApiError(404, 'User not found');
        if (!user.verifyOTP(otpCode)) throw new ApiError(400, 'Invalid or expired OTP');

        user.isVerified = true;
        user.otp = undefined;
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        return {
            user: this.sanitizeUser(user),
            accessToken: generateAccessToken(user._id),
            refreshToken: generateRefreshToken(user._id)
        };
    }

    async login(email, password) {
        const user = await User.findOne({ email }).select('+password +otp');
        if (!user) throw new ApiError(401, 'Invalid email or password');
        if (!user.isActive) throw new ApiError(403, 'Account deactivated');
        if (!await user.comparePassword(password)) throw new ApiError(401, 'Invalid email or password');

        const otpCode = user.generateOTP('login');
        await user.save({ validateBeforeSave: false });
        await emailService.sendOTPEmail(email, otpCode, 'login');
        return { email };
    }

    async verifyLoginOTP(email, otpCode) {
        const user = await User.findOne({ email }).select('+otp');
        if (!user) throw new ApiError(404, 'User not found');
        if (!user.verifyOTP(otpCode)) throw new ApiError(400, 'Invalid or expired OTP');

        user.otp = undefined;
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        return {
            user: this.sanitizeUser(user),
            accessToken: generateAccessToken(user._id),
            refreshToken: generateRefreshToken(user._id)
        };
    }

    async resendOTP(email, purpose = 'registration') {
        const user = await User.findOne({ email }).select('+otp');
        if (!user) throw new ApiError(404, 'User not found');
        if (user.otp?.expiresAt > Date.now()) {
            const wait = Math.ceil((user.otp.expiresAt - Date.now()) / 1000);
            throw new ApiError(429, `Wait ${wait}s before requesting new OTP`);
        }
        const otpCode = user.generateOTP(purpose);
        await user.save({ validateBeforeSave: false });
        await emailService.sendOTPEmail(email, otpCode, purpose);
    }

    async refreshAccessToken(refreshToken) {
        if (!refreshToken) throw new ApiError(401, 'No refresh token');
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) throw new ApiError(401, 'Invalid token');
        return { accessToken: generateAccessToken(user._id) };
    }

    async forgotPassword(email) {
        const user = await User.findOne({ email }).select('+otp');
        if (!user) throw new ApiError(404, 'No account found');
        const otpCode = user.generateOTP('password_reset');
        await user.save({ validateBeforeSave: false });
        await emailService.sendOTPEmail(email, otpCode, 'password_reset');
    }

    async verifyResetOTP(email, otpCode) {
        const user = await User.findOne({ email }).select('+otp');
        if (!user) throw new ApiError(404, 'User not found');
        if (!user.verifyOTP(otpCode)) throw new ApiError(400, 'Invalid or expired OTP');

        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = hashToken(resetToken);
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
        user.otp = undefined;
        await user.save({ validateBeforeSave: false });
        return resetToken;
    }

    async resetPassword(resetToken, newPassword) {
        const user = await User.findOne({
            resetPasswordToken: hashToken(resetToken),
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!user) throw new ApiError(400, 'Invalid or expired token');
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
    }

    async getUserById(userId) {
        const user = await User.findById(userId).select('-password -otp -resetPasswordToken -resetPasswordExpire');
        if (!user) throw new ApiError(404, 'User not found');
        return user;
    }

    sanitizeUser(user) {
        return { _id: user._id, fullName: user.fullName, email: user.email, role: user.role, isVerified: user.isVerified, avatar: user.avatar, preferences: user.preferences, createdAt: user.createdAt };
    }
}
module.exports = new AuthService();