/**
 * Seed the storefront recipes. Idempotent — upserts by title.
 * Usage: cd backend && node seed_recipes.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const Recipe = require('./src/models/Recipe');

const RECIPES = [
  {
    title: 'Creamy Strawberry Banana Smoothie Bowl',
    description: 'A thick and creamy smoothie bowl packed with fresh berries, sweet honey, and topped with crunchy organic almonds. The perfect energizing breakfast.',
    imageUrl: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&auto=format&fit=crop&q=80',
    prepTime: '5 mins', servings: '1-2', calories: '320 kcal', difficulty: 'Easy',
    ingredients: [
      { name: 'Fresh Bananas', note: 'Slices for topping and base' },
      { name: 'Organic Strawberries', note: 'Fresh ripe strawberries' },
      { name: 'Organic Honey', note: '1-2 tablespoons' },
      { name: 'Organic Almonds', note: 'Handful, crushed' },
    ],
    steps: [
      'Blend 1.5 frozen bananas with most of the strawberries and a splash of milk or water.',
      'Pour into a bowl and arrange banana slices, strawberry halves, and crushed organic almonds on top.',
      'Drizzle with organic honey before serving.',
    ],
  },
  {
    title: 'Regenerative Quinoa & Green Veggie Bowl',
    description: 'A warm and nourishing grain bowl packed with protein-rich quinoa, tender broccoli florets, baby spinach leaves, and sweet shredded organic carrots.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    prepTime: '15 mins', servings: '2', calories: '450 kcal', difficulty: 'Medium',
    ingredients: [
      { name: 'Quinoa Grain', note: '1 cup, cooked' },
      { name: 'Broccoli Florets', note: 'Lightly steamed' },
      { name: 'Fresh Spinach', note: 'Bed of baby spinach' },
      { name: 'Organic Carrots', note: 'Grated or sliced' },
    ],
    steps: [
      'Rinse and cook the quinoa according to package instructions.',
      'Lightly steam the broccoli florets until bright green and tender-crisp.',
      'Assemble the bowl: lay a generous bed of fresh spinach, add cooked quinoa, and top with broccoli and carrots.',
      'Dress with olive oil, lemon juice, or your favorite vinaigrette.',
    ],
  },
  {
    title: 'Fresh Avocado & Basil Bruschetta',
    description: 'Creamy smashed avocado and sweet organic red apple dices with fresh aromatic basil leaves, vibrant diced bell peppers, tossed in olive oil on toasted rustic bread.',
    imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=800&auto=format&fit=crop&q=80',
    prepTime: '10 mins', servings: '4', calories: '280 kcal', difficulty: 'Easy',
    ingredients: [
      { name: 'Organic Avocados', note: 'Ripe, mashed or sliced' },
      { name: 'Fresh Basil', note: 'Aromatic leaves, torn' },
      { name: 'Organic Red Apples', note: 'Finely diced for crisp sweetness' },
      { name: 'Bell Peppers Mix', note: 'Diced colorful bell peppers' },
    ],
    steps: [
      'Toast slices of rustic bread until golden and crisp.',
      'Mash the avocado and spread generously over each slice.',
      'Top with diced apple, bell peppers, and torn basil. Drizzle with olive oil and season to taste.',
    ],
  },
];

async function run() {
  if (!process.env.MONGODB_URI) { console.error('❌ MONGODB_URI not found.'); process.exit(1); }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.\n');
  for (const r of RECIPES) {
    await Recipe.findOneAndUpdate({ title: r.title }, { $set: { ...r, isActive: true } }, { new: true, upsert: true });
    console.log(`🍳 Recipe ready: ${r.title}`);
  }
  console.log(`\n✅ ${await Recipe.countDocuments()} recipes in the database.`);
  await mongoose.connection.close();
}

run().catch((e) => { console.error('❌', e.message); process.exit(1); });
