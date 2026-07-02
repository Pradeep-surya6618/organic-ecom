const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide your name'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters']
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please provide a valid email'
            ]
        },
        phone: {
            type: String,
            trim: true,
            match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
        },
        password: {
            type: String,
            minlength: [6, 'Password must be at least 6 characters'],
            select: false
        },
        avatar: {
            data: Buffer,
            contentType: String
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        otp: {
            code: {
                type: String,
                select: false
            },
            expiresAt: {
                type: Date,
                select: false
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);