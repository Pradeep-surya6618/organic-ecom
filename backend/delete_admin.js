/**
 * Delete a user (by default the old seeded admin) from the database.
 *
 * Usage:
 *   node delete_admin.js                       # deletes admin@organicstore.com
 *   node delete_admin.js someone@example.com   # deletes a specific email
 *
 * NOTE: The old admin (admin@organicstore.com) is auto-recreated by
 * ensureAdminExists() in src/routes/auth.routes.js on the next login attempt
 * with that email. Remove/disable that block too, or it will come back.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const User = require('./src/models/User');

const emailArg = process.argv[2] || 'admin@organicstore.com';

async function run() {
    if (!process.env.MONGODB_URI) {
        console.log('❌ MONGODB_URI not found. Check backend/.env.local');
        process.exit(1);
    }

    const email = emailArg.toLowerCase().trim();

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const user = await User.findOne({ email });
    if (!user) {
        console.log(`ℹ️  No user found with email "${email}". Nothing to delete.`);
    } else {
        console.log(`Found: ${user.name} | ${user.email} | role=${user.role}`);
        const result = await User.deleteOne({ email });
        console.log(`✅ Deleted ${result.deletedCount} user(s) with email "${email}".`);
    }

    await mongoose.connection.close();
}

run().catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
