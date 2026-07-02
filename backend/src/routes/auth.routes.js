const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('../services/email.service');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars-long';

// Helper: Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── 1. REGISTER ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;

        if (!fullName || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: 'All registration fields are required' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email address is already registered' });
        }

        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ success: false, message: 'Phone number is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otpCode = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const user = await User.create({
            name: fullName,
            email,
            phone,
            password: hashedPassword,
            isVerified: false,
            otp: {
                code: otpCode,
                expiresAt: otpExpiresAt
            }
        });

        console.log(`🔑 Verification code for registration (${email}): ${otpCode}`);

        // Send OTP email in the background — don't block the response on it
        emailService.sendOTPEmail(email, otpCode, 'registration')
            .catch((emailErr) => console.error(`✉️ Failed to send registration OTP email to ${email}:`, emailErr.message));

        res.status(201).json({
            success: true,
            data: {
                message: 'Verification code sent to your email',
                email: user.email,
                expiresIn: 600
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── 2. VERIFY REGISTRATION OTP ──────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP required' });
        }

        const user = await User.findOne({ email }).select('+otp.code +otp.expiresAt');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        if (!user.otp.code || !user.otp.expiresAt || new Date() > user.otp.expiresAt) {
            return res.status(400).json({ success: false, message: 'Verification code has expired. Request a new one.' });
        }

        if (user.otp.code !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid verification code' });
        }

        user.isVerified = true;
        user.otp.code = undefined;
        user.otp.expiresAt = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                fullName: user.name,
                email: user.email,
                role: user.role,
                token
            },
            message: 'Email verified successfully'
        });
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── 3. LOGIN (EMAIL & PASSWORD -> SENDS OTP) ───────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const otpCode = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = {
            code: otpCode,
            expiresAt: otpExpiresAt
        };
        await user.save();

        console.log(`🔑 Login verification code for (${email}): ${otpCode}`);

        // Send OTP email in the background — don't block the response on it
        emailService.sendOTPEmail(email, otpCode, 'login')
            .catch((emailErr) => console.error(`✉️ Failed to send login OTP email to ${email}:`, emailErr.message));

        res.status(200).json({
            success: true,
            data: {
                message: 'Login verification code sent',
                email: user.email,
                expiresIn: 600
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── 4. VERIFY LOGIN OTP ────────────────────────────────────────────
router.post('/verify-login-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP required' });
        }

        const user = await User.findOne({ email }).select('+otp.code +otp.expiresAt');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        if (!user.otp.code || !user.otp.expiresAt || new Date() > user.otp.expiresAt) {
            return res.status(400).json({ success: false, message: 'Verification code has expired. Request a new one.' });
        }

        if (user.otp.code !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid verification code' });
        }

        user.otp.code = undefined;
        user.otp.expiresAt = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                fullName: user.name,
                email: user.email,
                role: user.role,
                token
            },
            message: 'Logged in successfully'
        });
    } catch (err) {
        console.error('Verify login OTP error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── 5. RESEND OTP ──────────────────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
    try {
        const { email, purpose } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email address required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        const otpCode = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = {
            code: otpCode,
            expiresAt: otpExpiresAt
        };
        await user.save();

        console.log(`🔑 Resent OTP for (${email}) for [${purpose || 'auth'}]: ${otpCode}`);

        // Send OTP email in the background — don't block the response on it
        emailService.sendOTPEmail(email, otpCode, purpose || 'registration')
            .catch((emailErr) => console.error(`✉️ Failed to send resent OTP email to ${email}:`, emailErr.message));

        res.status(200).json({
            success: true,
            message: 'A new security code has been sent'
        });
    } catch (err) {
        console.error('Resend OTP error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── 6. FORGOT PASSWORD ─────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email address required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account matches this email' });
        }

        const otpCode = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = {
            code: otpCode,
            expiresAt: otpExpiresAt
        };
        await user.save();

        console.log(`🔑 Password reset verification code for (${email}): ${otpCode}`);

        // Send OTP email in the background — don't block the response on it
        emailService.sendOTPEmail(email, otpCode, 'password_reset')
            .catch((emailErr) => console.error(`✉️ Failed to send password reset OTP email to ${email}:`, emailErr.message));

        res.status(200).json({
            success: true,
            message: 'A password reset security code has been sent'
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── 7. VERIFY RESET OTP ────────────────────────────────────────────
router.post('/verify-reset-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP required' });
        }

        const user = await User.findOne({ email }).select('+otp.code +otp.expiresAt');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        if (!user.otp.code || !user.otp.expiresAt || new Date() > user.otp.expiresAt) {
            return res.status(400).json({ success: false, message: 'Reset code expired. Request a new one.' });
        }

        if (user.otp.code !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid reset code' });
        }

        // Clean OTP and generate a short-lived reset token
        user.otp.code = undefined;
        user.otp.expiresAt = undefined;
        await user.save();

        const resetToken = jwt.sign({ id: user._id, purpose: 'reset-password' }, JWT_SECRET, { expiresIn: '15m' });

        res.status(200).json({
            success: true,
            data: {
                resetToken
            },
            message: 'Reset code verified'
        });
    } catch (err) {
        console.error('Verify reset OTP error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── 8. RESET PASSWORD ──────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({ success: false, message: 'Token and new password required' });
        }

        let decoded;
        try {
            decoded = jwt.verify(resetToken, JWT_SECRET);
        } catch {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        if (decoded.purpose !== 'reset-password') {
            return res.status(400).json({ success: false, message: 'Invalid token purpose' });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── 9. LOGOUT ─────────────────────────────────────────────────────
router.post('/logout', async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

// ── 10. GET ME (PROFILE) ──────────────────────────────────────────
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'No authorization token' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User session expired' });
        }

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                fullName: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch {
        res.status(401).json({ success: false, message: 'Invalid or expired session token' });
    }
});

// ── 11. UPDATE PROFILE ────────────────────────────────────────────
router.put('/update-profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'No authorization token' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const { name, phone } = req.body;

        const user = await User.findByIdAndUpdate(
            decoded.id,
            { ...(name && { name }), ...(phone && { phone }) },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified
            },
            message: 'Profile updated successfully'
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;