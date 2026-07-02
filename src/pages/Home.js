import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, HeartHandshake, Leaf, Quote, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import Hero from "../components/HeroSlider";
import CategorySection from "../components/CategorySection";
import ProductGrid from "../components/ProductGrid";
import { useProducts } from "../context/ProductContext";
import { useReviews } from "../context/ReviewContext";

const filters = [
  { label: "Popular", value: "all" },
  { label: "Fruits", value: "fruits" },
  { label: "Vegetables", value: "vegetables" },
  { label: "Pantry", value: "pantry" },
];

const promises = [
  { icon: Leaf, title: "Picked for freshness", text: "Produce is checked every morning before it reaches our shelves." },
  { icon: Truck, title: "Fast without shortcuts", text: "Neighborhood fulfillment keeps every delivery quick and careful." },
  { icon: ShieldCheck, title: "Standards you can trust", text: "Clear labels, responsible sourcing, and a freshness guarantee." },
  { icon: HeartHandshake, title: "Local farms first", text: "We prioritize growers close to the communities we serve." },
];

export default function Home() {
  const { visibleProducts: products } = useProducts();
  const { approvedReviews } = useReviews();
  const [filter, setFilter] = useState("all");
  const [stories, setStories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { blogAPI } = await import("../services/api");
        const res = await blogAPI.getAll({ limit: 6 });
        setStories(res?.data?.blogs || []);
      } catch (e) { /* ignore */ }
    })();
  }, []);
  const filteredProducts = useMemo(
    () =>
      filter === "all"
        ? products.slice(0, 8)
        : products.filter((p) => p.category === filter).slice(0, 8),
    [filter, products]
  );

  return (
    <div className="overflow-hidden bg-[#fbfcf9]">
      <Hero />

      {/* Reduced vertical spacing on mobile */}
      <div className="space-y-12 py-10 sm:space-y-20 sm:py-16 lg:space-y-24 lg:py-20">
        <CategorySection />

        {/* ── Fresh picks section ── */}
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                This week's favorites
              </p>
              <h2 className="mt-2 font-sans text-2xl font-black tracking-[-0.035em] text-stone-900 sm:text-3xl sm:text-4xl">
                Fresh picks, moving fast.
              </h2>
              <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-stone-500">
                Customer-loved staples, seasonal finds, and clean-label pantry heroes.
              </p>
            </div>
            {/* Filter pills — horizontal scroll on mobile */}
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1 scrollbar-none">
              {filters.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  className={`min-h-10 shrink-0 rounded-xl px-4 text-sm font-extrabold transition sm:min-h-12 sm:px-5 ${
                    filter === item.value
                      ? "bg-[#153d2b] text-white shadow-lg shadow-emerald-950/10"
                      : "border border-stone-200 bg-white text-stone-600 hover:border-emerald-300 hover:text-emerald-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 sm:mt-8">
            <ProductGrid products={filteredProducts} />
          </div>
          <div className="mt-6 text-center sm:mt-8">
            <Link
              to="/shop"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 text-sm font-extrabold text-stone-700 transition hover:border-emerald-300 hover:text-emerald-800 sm:min-h-12 sm:px-6"
            >
              See all fresh products <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        {/* ── Organic standard banner ── */}
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[24px] bg-[#153d2b] px-5 py-8 text-white sm:rounded-[32px] sm:px-10 sm:py-14 lg:px-14">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-lime-300/10 blur-2xl" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-extrabold text-lime-200 ring-1 ring-white/10">
                  <Sparkles size={15} /> The Organic Standard
                </span>
                <h2 className="mt-4 font-sans text-2xl font-black tracking-[-0.035em] sm:mt-5 sm:text-3xl sm:text-4xl">
                  Freshness is not a label. It's the whole system.
                </h2>
                <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-emerald-50/70 sm:mt-4">
                  From the farms we choose to the routes our riders take, every decision is designed to deliver food that looks better, lasts longer, and tastes the way it should.
                </p>
                <Link
                  to="/about"
                  className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-lime-300 px-5 text-sm font-extrabold text-emerald-950 transition hover:bg-lime-200 sm:mt-7 sm:min-h-12"
                >
                  Our sourcing promise <ArrowRight size={17} />
                </Link>
              </div>
              {/* Promise cards — 2-col on mobile, 2-col on desktop */}
              <div className="grid grid-cols-2 gap-3">
                {promises.map(({ icon: Icon, title, text }) => (
                  <article
                    key={title}
                    className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur-sm sm:p-5"
                  >
                    <Icon size={20} className="text-lime-300 sm:text-[22px]" />
                    <h3 className="mt-3 font-sans text-sm font-extrabold sm:mt-4 sm:text-base">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-[11px] font-medium leading-5 text-emerald-50/65 sm:mt-2 sm:text-xs">
                      {text}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Hero image + testimonial ── */}
        <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 sm:gap-5 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          {/* Hero image */}
          <div className="relative min-h-[280px] overflow-hidden rounded-[24px] sm:min-h-[430px] sm:rounded-[30px]">
            <img
              src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=85"
              alt="Colorful fresh produce"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-950/15 to-transparent" />
            <div className="absolute bottom-0 p-5 text-white sm:p-7 sm:p-9">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-200">
                Seasonal drop
              </p>
              <h2 className="mt-2 max-w-lg font-sans text-xl font-black tracking-tight sm:text-3xl sm:text-4xl">
                Summer color, picked at its peak.
              </h2>
              <p className="mt-2 max-w-lg text-xs font-medium leading-6 text-white/75 sm:mt-3 sm:text-sm">
                Discover juicy stone fruit, sweet berries, and crisp salad staples from nearby growers.
              </p>
              <Link
                to="/shop?category=fruits"
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-extrabold text-emerald-950 sm:mt-6 sm:min-h-12 sm:px-5"
              >
                Shop the harvest <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="flex flex-col justify-between rounded-[24px] bg-amber-100 p-6 sm:rounded-[30px] sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Quote size={28} className="text-amber-700/40" />
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-800">Customer Testimonials</h3>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-none">
              {approvedReviews.length > 0 ? (
                approvedReviews.map((rev) => (
                  <div key={rev._id} className="border-b border-amber-250/40 pb-4 last:border-b-0 last:pb-0">
                    <p className="font-sans text-sm font-extrabold leading-snug tracking-tight text-stone-900 italic">
                      "{rev.text}"
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-stone-950">{rev.author}</p>
                        <p className="text-[10px] font-bold text-stone-500">Verified Customer</p>
                      </div>
                      <div className="flex gap-0.5 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={12} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div>
                  <p className="font-sans text-sm font-extrabold leading-snug text-stone-600 italic">
                    "It feels like a farmer's market showed up at my door, only faster."
                  </p>
                  <p className="mt-2 text-xs font-black text-stone-900">Mark Antony</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Journal ── */}
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                From our journal
              </p>
              <h2 className="mt-2 font-sans text-2xl font-black tracking-[-0.035em] text-stone-900 sm:text-3xl sm:text-4xl">
                Eat well. Waste less.
              </h2>
            </div>
            <Link
              to="/"
              className="hidden min-h-12 items-center gap-2 text-sm font-extrabold text-emerald-800 sm:flex"
            >
              View all stories <ArrowRight size={17} />
            </Link>
          </div>

          {/* Stories — single col on mobile, 3-col on md+ */}
          <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 md:grid-cols-3">
            {stories.map((story) => (
              <article
                key={story._id}
                className="group overflow-hidden rounded-[20px] border border-stone-200 bg-white sm:rounded-[24px]"
              >
                <div className="overflow-hidden">
                  <img
                    src={story.imageUrl}
                    alt=""
                    className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-emerald-700">
                    <span>{story.category}</span>
                    <span className="text-stone-400">
                      {new Date(story.publishedAt || story.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <h3 className="mt-2 font-sans text-base font-extrabold leading-snug text-stone-900 sm:mt-3 sm:text-lg">
                    {story.title}
                  </h3>
                  <Link
                    to={`/blog/${story.slug}`}
                    className="mt-3 inline-flex min-h-10 items-center gap-2 text-xs font-extrabold text-stone-600 group-hover:text-emerald-700 sm:mt-4 sm:min-h-12"
                  >
                    Read the story <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* "View all" link visible on mobile below the cards */}
          <div className="mt-5 text-center sm:hidden">
            <Link
              to="/"
              className="inline-flex min-h-10 items-center gap-2 text-sm font-extrabold text-emerald-800"
            >
              View all stories <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}