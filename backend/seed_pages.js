/**
 * Seed the editable content pages (About + support pages).
 * Idempotent — upserts by slug. Usage: cd backend && node seed_pages.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const Page = require('./src/models/Page');

const PAGES = [
  {
    slug: 'about',
    title: 'About Organic Store',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80',
    body: `Organic Store began with a simple belief: everyone deserves fresh, honest food.

We work directly with local, regenerative farms to bring you produce that's picked at peak ripeness and delivered to your door in as little as 10 minutes. No middlemen, no long cold-chains — just clean, organic food you can trust.

Our mission is to make healthy eating effortless and affordable, while supporting the growers who care for the land. Thank you for being part of the journey.`,
  },
  {
    slug: 'faq',
    title: 'Frequently Asked Questions',
    body: `How fast is delivery?
Most orders arrive in 10–60 minutes depending on your location.

Is everything really organic?
Yes — all produce is certified organic and sourced from trusted local farms.

What are the delivery charges?
Delivery is free on orders above ₹500. A small fee applies below that.

Which payment methods do you accept?
Cash on delivery and online payments (UPI / cards) via Razorpay.`,
  },
  {
    slug: 'shipping',
    title: 'Shipping Information',
    body: `We deliver 7 days a week, 7am–11pm.

Express delivery: 10–60 minutes in serviceable areas.
Standard delivery: 2–3 hours.

Free delivery on orders over ₹500. You'll receive live tracking once your order is dispatched.`,
  },
  {
    slug: 'returns',
    title: 'Returns & Refunds',
    body: `Not happy with your order? We've got you covered.

If any item arrives damaged or not fresh, contact us within 24 hours for a full refund or replacement — no questions asked.

Refunds are processed to your original payment method within 3–5 business days.`,
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    body: `Your privacy matters to us.

We collect only the information needed to process your orders and improve your experience — your name, contact details, and delivery address.

We never sell your data. Payment information is handled securely by our payment partner and is never stored on our servers.`,
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    body: `Welcome to Organic Store.

By using our website and services, you agree to provide accurate account and delivery information, and to use the platform for lawful personal shopping only.

Prices and availability may change without notice. Orders are subject to acceptance and successful payment. These terms may be updated periodically.`,
  },
];

async function run() {
  if (!process.env.MONGODB_URI) { console.error('❌ MONGODB_URI not found.'); process.exit(1); }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.\n');
  for (const p of PAGES) {
    await Page.findOneAndUpdate({ slug: p.slug }, { $set: p }, { new: true, upsert: true });
    console.log(`📄 Page ready: /${p.slug}`);
  }
  console.log(`\n✅ ${await Page.countDocuments()} pages in the database.`);
  await mongoose.connection.close();
}

run().catch((e) => { console.error('❌', e.message); process.exit(1); });
