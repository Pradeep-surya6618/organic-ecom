const app = require('../src/app');
const connectDB = require('../src/config/db');

// Connect to the database
// Vercel serverless functions are ephemeral, but mongoose handles connection pooling
connectDB();

// Export the express app for Vercel Serverless Functions
module.exports = app;
