/**
 * Seed script — creates the real Categories and migrates the storefront's
 * 12 products into MongoDB. Idempotent: upserts by category slug and product
 * sku, so it is safe to run multiple times without creating duplicates.
 *
 * Usage:  cd backend  &&  node seed.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');

const CATEGORIES = [
  { name: 'Fruits', slug: 'fruits', order: 1 },
  { name: 'Vegetables', slug: 'vegetables', order: 2 },
  { name: 'Pantry', slug: 'pantry', order: 3 },
  { name: 'Nuts & Seeds', slug: 'nuts', order: 4 },
  { name: 'Fresh Herbs', slug: 'herbs', order: 5 },
];

// The 12 storefront products (previously hardcoded in src/data/products.js).
const PRODUCTS = [
  { sku: 'ORG-1', name: 'Organic Red Apples', categorySlug: 'fruits', price: 4.99, comparePrice: 6.99, rating: 4.8, reviews: 128, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop', badge: 'Best Seller', description: 'Crisp, sweet, and organically grown red apples from local farms.', weight: '1 kg', tags: ['organic', 'fresh', 'local'] },
  { sku: 'ORG-2', name: 'Fresh Bananas', categorySlug: 'fruits', price: 2.49, comparePrice: 3.49, rating: 4.6, reviews: 95, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop', badge: 'Sale', description: 'Ripe, sweet bananas perfect for smoothies and snacks.', weight: '1 bunch', tags: ['organic', 'potassium'] },
  { sku: 'ORG-3', name: 'Organic Carrots', categorySlug: 'vegetables', price: 3.29, comparePrice: null, rating: 4.7, reviews: 76, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop', badge: null, description: 'Fresh organic carrots, rich in beta-carotene and vitamins.', weight: '500 g', tags: ['organic', 'vitamin-a'] },
  { sku: 'ORG-4', name: 'Broccoli Florets', categorySlug: 'vegetables', price: 3.99, comparePrice: 5.49, rating: 4.5, reviews: 62, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=400&fit=crop', badge: 'Popular', description: 'Nutrient-dense broccoli florets, perfect for steaming or roasting.', weight: '400 g', tags: ['organic', 'superfood'] },
  { sku: 'ORG-5', name: 'Organic Avocados', categorySlug: 'fruits', price: 5.99, comparePrice: null, rating: 4.9, reviews: 203, image: 'https://images.unsplash.com/photo-1523049673856-6468baca294f?w=400&h=400&fit=crop', badge: 'Premium', description: 'Creamy, ripe avocados packed with healthy fats and nutrients.', weight: '3 pcs', tags: ['organic', 'healthy-fats'] },
  { sku: 'ORG-6', name: 'Fresh Spinach', categorySlug: 'vegetables', price: 2.99, comparePrice: 3.99, rating: 4.4, reviews: 88, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop', badge: 'Sale', description: 'Tender baby spinach leaves, washed and ready to use.', weight: '250 g', tags: ['organic', 'iron-rich'] },
  { sku: 'ORG-7', name: 'Organic Strawberries', categorySlug: 'fruits', price: 6.49, comparePrice: null, rating: 4.8, reviews: 156, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop', badge: 'Seasonal', description: 'Sweet, juicy strawberries picked at peak ripeness.', weight: '500 g', tags: ['organic', 'antioxidants'] },
  { sku: 'ORG-8', name: 'Bell Peppers Mix', categorySlug: 'vegetables', price: 4.49, comparePrice: 5.99, rating: 4.6, reviews: 71, image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop', badge: null, description: 'Colorful mix of red, yellow, and green bell peppers.', weight: '3 pcs', tags: ['organic', 'vitamin-c'] },
  { sku: 'ORG-9', name: 'Organic Honey', categorySlug: 'pantry', price: 12.99, comparePrice: null, rating: 4.9, reviews: 234, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop', badge: 'Best Seller', description: 'Raw, unfiltered organic honey from local beekeepers.', weight: '500 g', tags: ['organic', 'raw', 'local'] },
  { sku: 'ORG-10', name: 'Quinoa Grain', categorySlug: 'pantry', price: 7.99, comparePrice: 9.99, rating: 4.7, reviews: 112, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', badge: 'Sale', description: 'Organic quinoa, a complete protein source for healthy meals.', weight: '1 kg', tags: ['organic', 'gluten-free', 'protein'] },
  { sku: 'ORG-11', name: 'Organic Almonds', categorySlug: 'nuts', price: 9.99, comparePrice: null, rating: 4.8, reviews: 189, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&h=400&fit=crop', badge: 'Premium', description: 'Raw organic almonds, perfect for snacking or baking.', weight: '500 g', tags: ['organic', 'protein', 'healthy-fats'] },
  { sku: 'ORG-12', name: 'Fresh Basil', categorySlug: 'herbs', price: 2.99, comparePrice: null, rating: 4.5, reviews: 45, image: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400&h=400&fit=crop', badge: null, description: 'Aromatic fresh basil leaves for cooking and garnishing.', weight: '100 g', tags: ['organic', 'fresh', 'aromatic'] },
];

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found. Check backend/.env.local');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.\n');

  // 1. Upsert categories, keeping a slug -> _id map.
  const catMap = {};
  for (const c of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { slug: c.slug },
      { $set: { name: c.name, slug: c.slug, order: c.order, isActive: true } },
      { new: true, upsert: true }
    );
    catMap[c.slug] = doc._id;
    console.log(`📁 Category ready: ${c.name}`);
  }

  console.log('');

  // 2. Upsert products by sku (idempotent).
  for (const p of PRODUCTS) {
    const isFeatured = p.badge === 'Best Seller' || p.badge === 'Popular';
    await Product.findOneAndUpdate(
      { sku: p.sku },
      {
        $set: {
          name: p.name,
          description: p.description,
          price: p.price,
          comparePrice: p.comparePrice || undefined,
          category: catMap[p.categorySlug],
          stock: 25,
          unit: 'piece',
          weight: p.weight,
          tags: p.tags,
          imageUrl: p.image,
          badge: p.badge || undefined,
          isActive: true,
          isFeatured,
          organic: true,
          ratings: { average: p.rating, count: p.reviews },
        },
      },
      { new: true, upsert: true, runValidators: true }
    );
    console.log(`🛒 Product ready: ${p.name}`);
  }

  const catCount = await Category.countDocuments();
  const prodCount = await Product.countDocuments();
  console.log(`\n✅ Seed complete — ${catCount} categories, ${prodCount} products in the database.`);

  await mongoose.connection.close();
}

run().catch((err) => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
