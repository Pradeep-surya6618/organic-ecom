const User = require('../models/User');
const { sendEmail } = require('../config/nodemailer');
const { generateOTP, getOTPEmailTemplate } = require('../utils/helpers');
const { generateToken } = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Send OTP for registration/login
// @route   POST /api/v1/auth/send-otp
// @access  Public
const sendOTP = asyncHandler(async (req, res) => {
    const { email, name } = req.body;

    if (!email) {
        throw new ApiError('Please provide an email', 400);
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user = await User.findOne({ email });

    if (!user) {
        // New user - create with name
        if (!name) {
            throw new ApiError('Please provide your name for registration', 400);
        }
        user = await User.create({
            name,
            email,
            otp: {
                code: otp,
                expiresAt: otpExpiresAt
            }
        });
    } else {
        // Existing user - update OTP
        user.otp = {
            code: otp,
            expiresAt: otpExpiresAt
        };
        await user.save();
    }

    // DEBUG: Log OTP to console (remove in production)
    console.log(`🔑 OTP for ${email}: ${otp}`);

    // Send OTP email
    try {
        await sendEmail({
            to: email,
            subject: 'Your OTP for Organic Store',
            html: getOTPEmailTemplate(user.name || name, otp)
        });
    } catch (emailError) {
        console.error('Email sending failed:', emailError.message);
        // Continue even if email fails - user can see OTP in console for testing
    }

    res.status(200).json(
        new ApiResponse(200, { email }, 'OTP sent successfully to your email')
    );
});

// @desc    Verify OTP and login/register
// @route   POST /api/v1/auth/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError('Please provide email and OTP', 400);
    }

    const user = await User.findOne({ email }).select('+otp.code +otp.expiresAt');

    if (!user) {
        throw new ApiError('User not found. Please request OTP first', 404);
    }

    if (!user.otp.code || !user.otp.expiresAt) {
        throw new ApiError('No OTP found. Please request a new one', 400);
    }

    if (new Date() > user.otp.expiresAt) {
        throw new ApiError('OTP has expired. Please request a new one', 400);
    }

    if (user.otp.code !== otp) {
        throw new ApiError('Invalid OTP. Please try again', 400);
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp.code = undefined;
    user.otp.expiresAt = undefined;
    await user.save();

    // Generate token
    const token = generateToken({ id: user._id, role: user.role });

    // Set cookie
    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    res.cookie('token', token, cookieOptions);

    res.status(200).json(
        new ApiResponse(200, {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified
            },
            token
        }, 'OTP verified successfully. You are now logged in.')
    );
});

// @desc    Resend OTP
// @route   POST /api/v1/auth/resend-otp
// @access  Public
const resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError('Please provide an email', 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError('User not found. Please register first', 404);
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = {
        code: otp,
        expiresAt: otpExpiresAt
    };
    await user.save();

    // DEBUG: Log OTP to console
    console.log(`🔑 Resent OTP for ${email}: ${otp}`);

    // Send OTP email
    try {
        await sendEmail({
            to: email,
            subject: 'Your New OTP for Organic Store',
            html: getOTPEmailTemplate(user.name, otp)
        });
    } catch (emailError) {
        console.error('Email sending failed:', emailError.message);
    }

    res.status(200).json(
        new ApiResponse(200, { email }, 'New OTP sent successfully')
    );
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json(
        new ApiResponse(200, null, 'Logged out successfully')
    );
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json(
        new ApiResponse(200, user, 'User profile fetched successfully')
    );
});

// @desc    Update user profile
// @route   PUT /api/v1/auth/update-profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { name, phone },
        { new: true, runValidators: true }
    );

    res.status(200).json(
        new ApiResponse(200, user, 'Profile updated successfully')
    );
});

module.exports = {
    sendOTP,
    verifyOTP,
    resendOTP,
    logout,
    getMe,
    updateProfile
};