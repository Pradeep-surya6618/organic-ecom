/**
 * Seed the promotional banners. Idempotent — upserts by title.
 * Usage: cd backend && node seed_banners.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const Banner = require('./src/models/Banner');

const BANNERS = [
  { title: 'Farm Fresh in 10 Minutes', type: 'Active Banner', location: 'Homepage Hero Banner', date: 'Updated 2h ago' },
  { title: '5 ways to make greens last', type: 'Lifestyle Tip', location: 'Healthy Living Blog', date: 'Published Jun 8' },
];

async function run() {
  if (!process.env.MONGODB_URI) { console.error('❌ MONGODB_URI not found.'); process.exit(1); }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.\n');
  for (const b of BANNERS) {
    await Banner.findOneAndUpdate({ title: b.title }, { $set: { ...b, isActive: true } }, { new: true, upsert: true });
    console.log(`📣 Banner ready: ${b.title}`);
  }
  console.log(`\n✅ ${await Banner.countDocuments()} banners in the database.`);
  await mongoose.connection.close();
}

run().catch((e) => { console.error('❌', e.message); process.exit(1); });
