/**
 * Seed a few published blog posts. Idempotent — upserts by slug.
 * Usage: cd backend && node seed_blogs.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const Blog = require('./src/models/Blog');
const User = require('./src/models/User');

const BLOGS = [
  {
    slug: 'make-leafy-greens-last-all-week',
    title: 'Make leafy greens last all week',
    category: 'Kitchen notes',
    excerpt: 'Simple storage tricks to keep spinach, kale and lettuce crisp for days.',
    content: 'Wash and dry your greens thoroughly, wrap them loosely in a clean cloth or paper towel, and store in an airtight container in the fridge. The cloth absorbs excess moisture — the main cause of wilting — keeping your greens fresh and crunchy all week long.',
    imageUrl: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=900&q=82',
  },
  {
    slug: 'inside-a-regenerative-family-farm',
    title: 'Inside a regenerative family farm',
    category: 'Meet the grower',
    excerpt: 'How one local family is rebuilding soil health, one harvest at a time.',
    content: 'Regenerative farming goes beyond organic — it actively restores the land. Through cover cropping, rotational grazing and minimal tillage, our partner farms rebuild soil carbon, boost biodiversity and grow more nutrient-dense produce. Meet the family behind your favourite greens.',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=82',
  },
  {
    slug: 'build-a-brighter-everyday-pantry',
    title: 'Build a brighter everyday pantry',
    category: 'Wellness',
    excerpt: 'Stock these organic staples for quick, wholesome meals any night.',
    content: 'A well-stocked pantry makes healthy eating effortless. Keep organic quinoa, raw honey, mixed nuts and a rainbow of dried herbs on hand, and you can turn any fresh produce into a nourishing meal in minutes. Here are our top picks for a brighter everyday pantry.',
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=82',
  },
];

async function run() {
  if (!process.env.MONGODB_URI) { console.error('❌ MONGODB_URI not found.'); process.exit(1); }
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });
  if (!admin) { console.error('❌ No admin user found — create one first.'); process.exit(1); }
  console.log('Connected.\n');
  for (const b of BLOGS) {
    await Blog.findOneAndUpdate(
      { slug: b.slug },
      { $set: { ...b, author: admin._id, isPublished: true, publishedAt: new Date() } },
      { new: true, upsert: true }
    );
    console.log(`📝 Blog ready: ${b.title}`);
  }
  console.log(`\n✅ ${await Blog.countDocuments()} blogs in the database.`);
  await mongoose.connection.close();
}

run().catch((e) => { console.error('❌', e.message); process.exit(1); });
