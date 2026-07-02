import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, Flame, Check, ShoppingCart, X, Utensils, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';

// Legacy static recipes — no longer used (the page loads from the API); kept for reference.
// eslint-disable-next-line no-unused-vars
const RECIPES = [
  {
    id: 1,
    title: "Creamy Strawberry Banana Smoothie Bowl",
    description: "A thick and creamy smoothie bowl packed with fresh berries, sweet honey, and topped with crunchy organic almonds. The perfect energizing breakfast.",
    image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&auto=format&fit=crop&q=80",
    prepTime: "5 mins",
    servings: "1-2",
    calories: "320 kcal",
    difficulty: "Easy",
    ingredients: [
      { name: "Fresh Bananas", productId: 2, quantity: 1, note: "Slices for topping and base" },
      { name: "Organic Strawberries", productId: 7, quantity: 1, note: "Fresh ripe strawberries" },
      { name: "Organic Honey", productId: 9, quantity: 1, note: "1-2 tablespoons" },
      { name: "Organic Almonds", productId: 11, quantity: 1, note: "Handful, crushed" }
    ],
    steps: [
      "Blend 1.5 frozen bananas with most of the strawberries and a splash of milk or water.",
      "Pour into a bowl and arrange banana slices, strawberry halves, and crushed organic almonds on top.",
      "Drizzle with organic honey before serving."
    ]
  },
  {
    id: 2,
    title: "Regenerative Quinoa & Green Veggie Bowl",
    description: "A warm and nourishing grain bowl packed with protein-rich quinoa, tender broccoli florets, baby spinach leaves, and sweet shredded organic carrots.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
    prepTime: "15 mins",
    servings: "2",
    calories: "450 kcal",
    difficulty: "Medium",
    ingredients: [
      { name: "Quinoa Grain", productId: 10, quantity: 1, note: "1 cup, cooked" },
      { name: "Broccoli Florets", productId: 4, quantity: 1, note: "Lightly steamed" },
      { name: "Fresh Spinach", productId: 6, quantity: 1, note: "Bed of baby spinach" },
      { name: "Organic Carrots", productId: 3, quantity: 1, note: "Grated or sliced" }
    ],
    steps: [
      "Rinse and cook the quinoa according to package instructions.",
      "Lightly steam the broccoli florets until bright green and tender-crisp.",
      "Assemble the bowl: lay a generous bed of fresh spinach, add cooked quinoa, and top with broccoli and carrots.",
      "Dress with olive oil, lemon juice, or your favorite vinaigrette."
    ]
  },
  {
    id: 3,
    title: "Fresh Avocado & Basil Bruschetta",
    description: "Creamy smashed avocado and sweet organic red apple dices with fresh aromatic basil leaves, vibrant diced bell peppers, tossed in olive oil on toasted rustic bread.",
    image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=800&auto=format&fit=crop&q=80",
    prepTime: "10 mins",
    servings: "4",
    calories: "280 kcal",
    difficulty: "Easy",
    ingredients: [
      { name: "Organic Avocados", productId: 5, quantity: 1, note: "Ripe, mashed or sliced" },
      { name: "Fresh Basil", productId: 12, quantity: 1, note: "Aromatic leaves, torn" },
      { name: "Organic Red Apples", productId: 1, quantity: 1, note: "Finely diced for crisp sweetness" },
      { name: "Bell Peppers Mix", productId: 8, quantity: 1, note: "Diced colorful bell peppers" }
    ],
    steps: [
      "Mash the ripe organic avocados with a pinch of salt and pepper.",
      "Finely dice the red apples and bell peppers, then mix them together.",
      "Toast rustic bread slices, spread the mashed avocado, and spoon the apple-pepper mixture on top.",
      "Garnish with torn fresh basil leaves and a drizzle of olive oil."
    ]
  }
];

export default function Recipes() {
  const { addToCart } = useCart();
  const { visibleProducts: products } = useProducts();
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [rawRecipes, setRawRecipes] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState({});
  const [successToast, setSuccessToast] = useState(null);

  // Load recipes from the API.
  useEffect(() => {
    (async () => {
      try {
        const { recipeAPI } = await import('../services/api');
        const res = await recipeAPI.getAll();
        setRawRecipes(res?.data || []);
      } catch (e) { /* ignore */ }
    })();
  }, []);

  // Normalise recipes and match each ingredient to a store product by name
  // (so it can be priced and added to the cart).
  const recipes = useMemo(() => {
    return (rawRecipes || []).map((r) => ({
      id: r._id,
      title: r.title,
      description: r.description,
      image: r.imageUrl,
      prepTime: r.prepTime,
      servings: r.servings,
      calories: r.calories,
      difficulty: r.difficulty,
      steps: r.steps || [],
      ingredients: (r.ingredients || []).map((ing) => {
        const prod = products.find((p) => p.name?.toLowerCase() === ing.name?.toLowerCase());
        return { name: ing.name, note: ing.note, productId: prod?.id };
      }),
    }));
  }, [rawRecipes, products]);

  // Pre-select all shoppable ingredients when recipes load.
  useEffect(() => {
    const init = {};
    recipes.forEach((r) => { init[r.id] = r.ingredients.map((i) => i.productId).filter(Boolean); });
    setSelectedIngredients(init);
  }, [recipes]);

  const toggleFavorite = (recipeId) => {
    setFavorites(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const handleIngredientToggle = (recipeId, productId) => {
    if (!productId) return;
    setSelectedIngredients(prev => {
      const current = prev[recipeId] || [];
      const updated = current.includes(productId)
        ? current.filter(id => id !== productId)
        : [...current, productId];
      return { ...prev, [recipeId]: updated };
    });
  };

  const addSelectedToCart = (recipe) => {
    const selectedIds = selectedIngredients[recipe.id] || [];
    if (selectedIds.length === 0) return;

    let addedCount = 0;
    selectedIds.forEach(id => {
      const storeProduct = products.find(p => p.id === id);
      if (storeProduct) {
        addToCart(storeProduct, 1);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setSuccessToast(`Successfully added ${addedCount} ingredients for "${recipe.title}" to your cart! 🛒`);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const filteredRecipes = useMemo(() => {
    if (difficultyFilter === 'All') return recipes;
    return recipes.filter(r => r.difficulty === difficultyFilter);
  }, [difficultyFilter, recipes]);

  return (
    <div className="min-h-screen bg-[#fbfcf9] py-12 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Farm-To-Table Kitchen</p>
          <h1 className="mt-3 font-sans text-4xl font-black tracking-[-0.04em] text-stone-900 sm:text-5xl">
            Organic Recipes & Meal Planner
          </h1>
          <p className="mt-4 text-stone-500 font-medium leading-relaxed">
            Browse delicious, nutrient-rich recipes crafted from our fresh organic products. Add ingredients directly to your shopping list with a single click.
          </p>

          {/* Difficulty Filter */}
          <div className="mt-8 flex justify-center gap-2">
            {['All', 'Easy', 'Medium'].map(level => (
              <button
                key={level}
                onClick={() => setDifficultyFilter(level)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer ${
                  difficultyFilter === level
                    ? 'bg-[#153d2b] text-white shadow-md shadow-emerald-950/10'
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-800'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Recipes Grid */}
        <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
          {filteredRecipes.map((recipe) => {
            const currentSelected = selectedIngredients[recipe.id] || [];
            
            return (
              <motion.article
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300"
              >
                {/* Image Section */}
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  
                  {/* Meta Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="rounded-xl bg-white/95 backdrop-blur-sm px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 shadow-sm">
                      {recipe.difficulty}
                    </span>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(recipe.id)}
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-stone-600 hover:text-red-500 hover:scale-105 transition shadow-sm cursor-pointer"
                  >
                    <Heart
                      size={16}
                      fill={favorites.includes(recipe.id) ? "currentColor" : "none"}
                      className={favorites.includes(recipe.id) ? "text-red-500" : ""}
                    />
                  </button>

                  <h3 className="absolute bottom-4 left-4 right-4 font-sans text-lg font-black leading-snug text-white">
                    {recipe.title}
                  </h3>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold leading-relaxed text-stone-500">
                      {recipe.description}
                    </p>

                    {/* Stats */}
                    <div className="mt-4 flex gap-4 border-b border-stone-100 pb-4 text-stone-500 text-xs font-bold">
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-emerald-700" /> {recipe.prepTime}</span>
                      <span className="flex items-center gap-1.5"><Users size={14} className="text-emerald-700" /> {recipe.servings} Servings</span>
                      <span className="flex items-center gap-1.5"><Flame size={14} className="text-emerald-700" /> {recipe.calories}</span>
                    </div>

                    {/* Ingredient Shop Checklist */}
                    <div className="mt-5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 mb-3">Shop Ingredients:</h4>
                      <div className="space-y-2">
                        {recipe.ingredients.map(ing => {
                          const storeProduct = products.find(p => p.id === ing.productId);
                          const isChecked = currentSelected.includes(ing.productId);
                          return (
                            <div
                              key={ing.productId || ing.name}
                              onClick={() => handleIngredientToggle(recipe.id, ing.productId)}
                              className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                                isChecked 
                                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950 font-bold' 
                                  : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                                  isChecked 
                                    ? 'bg-emerald-700 border-emerald-700 text-white' 
                                    : 'border-stone-300 bg-white'
                                }`}>
                                  {isChecked && <Check size={11} strokeWidth={3} />}
                                </span>
                                <div>
                                  <p>{ing.name} <span className="text-[10px] font-normal text-stone-400">({ing.note})</span></p>
                                </div>
                              </div>
                              <span className="text-[11px] font-extrabold text-stone-700">
                                {storeProduct ? `₹${storeProduct.price.toFixed(2)}` : 'N/A'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-stone-100 flex gap-2">
                    <button
                      onClick={() => setSelectedRecipe(recipe)}
                      className="flex-1 min-h-11 flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 hover:border-emerald-300 bg-white text-xs font-extrabold text-stone-700 hover:text-emerald-800 transition cursor-pointer"
                    >
                      <Utensils size={14} /> View Steps
                    </button>
                    <button
                      disabled={currentSelected.length === 0}
                      onClick={() => addSelectedToCart(recipe)}
                      className={`flex-1 min-h-11 flex items-center justify-center gap-1.5 rounded-xl text-xs font-extrabold text-white transition shadow-sm cursor-pointer ${
                        currentSelected.length > 0 
                          ? 'bg-[#153d2b] hover:bg-emerald-800 shadow-emerald-950/10' 
                          : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart size={14} /> Add to Cart
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Recipe Steps Modal */}
        <AnimatePresence>
          {selectedRecipe && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="relative max-w-lg w-full bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-5 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition cursor-pointer"
                >
                  <X size={18} />
                </button>

                {/* Hero Header */}
                <div className="relative aspect-[16/8] bg-stone-100">
                  <img
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-5 left-6 right-6 text-white">
                    <p className="text-[10px] font-black uppercase tracking-wider text-lime-300">{selectedRecipe.difficulty} Recipe</p>
                    <h3 className="mt-1 font-sans text-xl font-black leading-snug">{selectedRecipe.title}</h3>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 text-center border-b border-stone-100 pb-5 text-stone-500 text-xs font-bold">
                    <div className="bg-stone-50 rounded-2xl p-2.5">
                      <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">Prep Time</p>
                      <p className="mt-1 font-black text-stone-800">{selectedRecipe.prepTime}</p>
                    </div>
                    <div className="bg-stone-50 rounded-2xl p-2.5">
                      <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">Servings</p>
                      <p className="mt-1 font-black text-stone-800">{selectedRecipe.servings}</p>
                    </div>
                    <div className="bg-stone-50 rounded-2xl p-2.5">
                      <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">Calories</p>
                      <p className="mt-1 font-black text-stone-800">{selectedRecipe.calories}</p>
                    </div>
                  </div>

                  {/* Cooking Steps */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 mb-4 flex items-center gap-1.5">
                      <Utensils size={15} className="text-emerald-700" /> Instructions:
                    </h4>
                    <ol className="space-y-4">
                      {selectedRecipe.steps.map((step, idx) => (
                        <li key={idx} className="flex gap-4 items-start text-xs leading-relaxed text-stone-600 font-semibold">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-black">
                            {idx + 1}
                          </span>
                          <p className="pt-0.5">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t border-stone-100 bg-stone-50/50 flex gap-3">
                  <button
                    onClick={() => setSelectedRecipe(null)}
                    className="flex-1 min-h-12 flex items-center justify-center rounded-xl bg-stone-200 hover:bg-stone-300 text-xs font-extrabold text-stone-700 transition cursor-pointer"
                  >
                    Close Directions
                  </button>
                  <button
                    onClick={() => {
                      addSelectedToCart(selectedRecipe);
                      setSelectedRecipe(null);
                    }}
                    className="flex-1 min-h-12 flex items-center justify-center gap-1.5 rounded-xl bg-[#153d2b] hover:bg-emerald-800 text-xs font-extrabold text-white transition shadow-sm cursor-pointer"
                  >
                    <ShoppingCart size={14} /> Add Ingredients
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Toast Success Alert */}
        <AnimatePresence>
          {successToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50 bg-[#153d2b] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-emerald-800 text-xs font-extrabold"
            >
              <span>{successToast}</span>
              <button
                onClick={() => setSuccessToast(null)}
                className="text-white/60 hover:text-white ml-2 transition p-1 hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
