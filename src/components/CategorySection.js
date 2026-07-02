import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const categories = [
  { name: "Fresh Fruits", count: "24 items", emoji: "🍓", color: "from-rose-100 to-orange-50", query: "fruits" },
  { name: "Vegetables", count: "31 items", emoji: "🥬", color: "from-emerald-100 to-lime-50", query: "vegetables" },
  { name: "Pantry", count: "46 items", emoji: "🍯", color: "from-amber-100 to-yellow-50", query: "pantry" },
  { name: "Wellness", count: "18 items", emoji: "🌿", color: "from-sky-100 to-emerald-50", query: "wellness" },
];

export default function CategorySection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Explore the market</p>
          <h2 className="mt-2 font-sans text-3xl font-black tracking-[-0.035em] text-stone-900 sm:text-4xl">Good food starts here.</h2>
          <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-stone-500">Thoughtfully sourced essentials for brighter breakfasts, quicker dinners, and healthier everyday choices.</p>
        </div>
        <Link to="/shop" className="inline-flex min-h-12 items-center gap-2 text-sm font-extrabold text-emerald-800 hover:text-emerald-600">Browse everything <ArrowUpRight size={17} /></Link>
      </div>
      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link key={category.name} to={`/shop?category=${category.query}`} className={`group relative min-h-56 overflow-hidden rounded-[24px] bg-gradient-to-br ${category.color} p-5 ring-1 ring-stone-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/10 sm:min-h-64 sm:p-6`}>
            <span className="absolute -bottom-5 -right-4 text-[110px] opacity-80 transition duration-300 group-hover:rotate-6 group-hover:scale-110 sm:text-[140px]">{category.emoji}</span>
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-stone-700 shadow-sm backdrop-blur-sm"><ArrowUpRight size={18} /></span>
            <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6">
              <h3 className="font-sans text-lg font-black text-stone-900 sm:text-xl">{category.name}</h3>
              <p className="mt-1 text-xs font-bold text-stone-500">{category.count}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
