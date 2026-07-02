import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock3, Leaf, ShieldCheck, Star, Truck } from "lucide-react";

// Defaults — used until an admin saves a hero config, and to fill any missing fields.
export const HERO_DEFAULTS = {
  badge: "Now delivering in your neighborhood",
  heading: "Better groceries.",
  headingAccent: "At your door in 10.",
  subtext: "Farm-fresh produce, clean pantry essentials, and everyday wellness picks, carefully sourced and delivered before your kettle boils.",
  imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=88",
  primaryCtaText: "Shop fresh arrivals",
  primaryCtaLink: "/shop",
  secondaryCtaText: "How we source",
  secondaryCtaLink: "/about",
};

export default function HeroSlider() {
  const [hero, setHero] = useState(HERO_DEFAULTS);

  useEffect(() => {
    (async () => {
      try {
        const { heroAPI } = await import("../services/api");
        const res = await heroAPI.get();
        if (res?.data) setHero({ ...HERO_DEFAULTS, ...res.data });
      } catch (e) { /* keep defaults */ }
    })();
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#f4f6ef] px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-10">
      <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-lime-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative z-10 py-4 lg:py-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-extrabold text-emerald-800 shadow-sm">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" /><span className="relative h-2 w-2 rounded-full bg-emerald-600" /></span>
            {hero.badge}
          </span>
          <h1 className="mt-6 max-w-3xl font-sans text-[42px] font-black leading-[0.98] tracking-[-0.045em] text-[#173c2c] sm:text-6xl lg:text-7xl">
            {hero.heading}
            {hero.headingAccent && <span className="block text-emerald-600">{hero.headingAccent}</span>}
          </h1>
          <p className="mt-6 max-w-xl text-base font-medium leading-7 text-stone-600 sm:text-lg">
            {hero.subtext}
          </p>
          <div className="mt-8 flex flex-row gap-3">
            <Link to={hero.primaryCtaLink || "/shop"} className="inline-flex flex-1 sm:flex-none min-w-0 min-h-14 items-center justify-center gap-2 rounded-xl bg-[#153d2b] px-4 sm:px-7 text-center text-sm font-extrabold text-white shadow-xl shadow-emerald-950/15 transition hover:-translate-y-0.5 hover:bg-emerald-800">
              {hero.primaryCtaText} <ArrowRight size={18} className="shrink-0" />
            </Link>
            {hero.secondaryCtaText && (
              <Link to={hero.secondaryCtaLink || "/about"} className="inline-flex flex-1 sm:flex-none min-w-0 min-h-14 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 sm:px-7 text-center text-sm font-extrabold text-stone-700 transition hover:border-emerald-300 hover:text-emerald-800">
                {hero.secondaryCtaText}
              </Link>
            )}
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-stone-600">
            <span className="flex items-center gap-2"><Check className="text-emerald-600" size={16} /> No minimum order</span>
            <span className="flex items-center gap-2"><Check className="text-emerald-600" size={16} /> Freshness guaranteed</span>
            <span className="flex items-center gap-2"><Check className="text-emerald-600" size={16} /> Easy refunds</span>
          </div>
        </div>

        <div className="relative min-h-[460px] sm:min-h-[560px]">
          <div className="absolute inset-x-4 bottom-0 top-6 overflow-hidden rounded-[36px] bg-[#dfe8d2] shadow-2xl shadow-emerald-950/10 sm:inset-x-10">
            <img src={hero.imageUrl} alt="Fresh organic produce" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/45 via-transparent to-white/5" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-white">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-200">Picked this morning</p>
                <p className="mt-1 text-xl font-black">Local harvest collection</p>
              </div>
              <span className="hidden rounded-full bg-white/15 px-3 py-2 text-xs font-bold backdrop-blur-md sm:block">48 items</span>
            </div>
          </div>

          <div className="absolute left-0 top-0 rounded-xl sm:rounded-2xl bg-white p-2.5 sm:p-4 shadow-xl shadow-emerald-950/10 ring-1 ring-stone-200/80 sm:left-2 sm:top-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-lg sm:rounded-xl bg-amber-100 text-amber-700"><Clock3 className="h-4 w-4 sm:h-[21px] sm:w-[21px]" /></span>
              <div><p className="text-sm sm:text-lg font-black text-stone-900 leading-none">8:42</p><p className="mt-0.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400">Avg. delivery</p></div>
            </div>
          </div>

          <div className="absolute bottom-20 right-0 rounded-xl sm:rounded-2xl bg-white p-2.5 sm:p-4 shadow-xl shadow-emerald-950/10 ring-1 ring-stone-200/80 sm:bottom-10 sm:right-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex -space-x-2">
                {["1494790108377-be9c29b29330", "1507003211169-0a1dd7228f2d", "1438761681033-6461ffad8d80"].map((id) => <img key={id} src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=60&h=60&q=80`} alt="" className="h-6 w-6 sm:h-9 sm:w-9 rounded-full border-2 border-white object-cover" />)}
              </div>
              <div><p className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-stone-900"><Star fill="currentColor" className="h-3 w-3 sm:h-[13px] sm:w-[13px] shrink-0 text-amber-400" /> 4.9 / 5</p><p className="mt-0.5 sm:mt-1 text-[8px] sm:text-[10px] font-bold text-stone-400">2,000+ happy homes</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-7xl grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [Truck, "10-minute delivery", "Live order tracking"],
          [Leaf, "100% fresh picks", "Quality checked daily"],
          [ShieldCheck, "Safe & transparent", "Clear sourcing standards"],
          [Star, "Loved locally", "4.9 average rating"],
        ].map(([Icon, title, text]) => (
          <div key={title} className="flex items-center gap-3 rounded-2xl border border-stone-200/80 bg-white/80 p-4 backdrop-blur-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon size={18} /></span>
            <div><p className="text-xs font-extrabold text-stone-800">{title}</p><p className="mt-0.5 text-[10px] font-semibold text-stone-400">{text}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}
