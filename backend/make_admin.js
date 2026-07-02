const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/models/User');

async function makeAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully!');

        const email = 'gokulra2006@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} not found. Please register this email on the signup page first!`);
        } else {
            user.role = 'admin';
            await user.save();
            console.log(`Successfully promoted ${email} to 'admin' role!`);
        }

        await mongoose.connection.close();
        console.log('Connection closed.');
    } catch (error) {
        console.error('Error promoting user:', error);
        process.exit(1);
    }
}

makeAdmin();
