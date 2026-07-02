/**
 * Create (or update) an admin account.
 *
 * Usage:
 *   node create_admin.js <email> <password> [name] [phone]
 *
 * Examples:
 *   node create_admin.js owner@store.com MyPass123
 *   node create_admin.js owner@store.com MyPass123 "Store Owner" 9876543210
 *
 * - If the email already exists, it is promoted to admin and its password is reset.
 * - If it does not exist, a new verified admin user is created.
 * The password is bcrypt-hashed (never stored in plain text).
 */

const path = require('path');
// Match server.js: load .env.local first (your real config), then .env as fallback.
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const [, , emailArg, passwordArg, nameArg, phoneArg] = process.argv;

async function run() {
    if (!emailArg || !passwordArg) {
        console.log('Usage: node create_admin.js <email> <password> [name] [phone]');
        process.exit(1);
    }
    if (passwordArg.length < 6) {
        console.log('❌ Password must be at least 6 characters.');
        process.exit(1);
    }
    if (phoneArg && !/^[0-9]{10}$/.test(phoneArg)) {
        console.log('❌ Phone must be exactly 10 digits.');
        process.exit(1);
    }
    if (!process.env.MONGODB_URI) {
        console.log('❌ MONGODB_URI not found. Check backend/.env.local');
        process.exit(1);
    }

    const email = emailArg.toLowerCase().trim();

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const hashedPassword = await bcrypt.hash(passwordArg, 10);
    let user = await User.findOne({ email });

    if (user) {
        user.password = hashedPassword;
        user.role = 'admin';
        user.isVerified = true;
        if (nameArg) user.name = nameArg;
        if (phoneArg) user.phone = phoneArg;
        await user.save();
        console.log(`✅ Existing user "${email}" promoted to admin and password reset.`);
    } else {
        user = await User.create({
            name: nameArg || 'Store Admin',
            email,
            phone: phoneArg || undefined,
            password: hashedPassword,
            role: 'admin',
            isVerified: true
        });
        console.log(`✅ New admin created: ${email}`);
    }

    console.log('\nLog in at /admin/login with this email + password.');
    console.log('The OTP will be printed in the backend terminal when you click Authenticate.');

    await mongoose.connection.close();
}

run().catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
