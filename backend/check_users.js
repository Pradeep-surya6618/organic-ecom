const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const User = require('./src/models/User');

async function checkUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully!');

        const users = await User.find({}, 'name email role isVerified');
        console.log('=== Registered Users ===');
        users.forEach(user => {
            console.log(`Name: ${user.name} | Email: ${user.email} | Role: ${user.role} | Verified: ${user.isVerified}`);
        });

        await mongoose.connection.close();
        console.log('Connection closed.');
    } catch (error) {
        console.error('Error checking users:', error);
        process.exit(1);
    }
}

checkUsers();
