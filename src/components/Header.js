import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Heart,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { siteSettingsAPI } from "../services/api";

const links = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Recipes", to: "/recipes" },
  { label: "About", to: "/about" },
  { label: "Reviews", to: "/reviews" },
  { label: "Contact", to: "/contact" },
];

// One repeatable strip of the ad-bar messages — two run back-to-back for a
// seamless looping marquee on mobile.
const PromoStrip = ({ items }) => (
  <div className="flex shrink-0 items-center gap-6 pr-6 text-[11px] font-bold text-emerald-50">
    {items.map((it, i) => (
      <span key={i} className="flex items-center gap-1.5">
        {i % 2 === 0
          ? <Zap size={12} fill="currentColor" className="text-lime-300" />
          : <MapPin size={12} />}
        {it}
      </span>
    ))}
  </div>
);

export default function Header() {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, isLoggedIn, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adBar, setAdBar] = useState({ enabled: true, text: "Fresh groceries delivered in 10 minutes", subtext: "Delivering near you · 7am–11pm" });

  // Top ad bar content is admin-editable (Content Manager → Banners).
  useEffect(() => {
    let alive = true;
    siteSettingsAPI.getAdBar()
      .then((res) => { if (alive && res?.data) setAdBar(res.data); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Lock background scroll while an overlay (mobile menu or profile dropdown) is open.
  useEffect(() => {
    const locked = menuOpen || profileOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, profileOpen]);

  const search = (event) => {
    event.preventDefault();
    if (query.trim()) navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    setMenuOpen(false);
  };

  const signOut = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <>
      {/* Ad bar — admin-editable, NOT sticky, scrolls away on scroll down */}
      {adBar.enabled && (adBar.text || adBar.subtext) && (
        <div className="bg-[#153d2b] text-white overflow-hidden">
          {/* Desktop / tablet: static two-column */}
          <div className="container-wide hidden sm:flex min-h-9 items-center justify-between gap-4 text-[11px] font-bold">
            {adBar.text && (
              <p className="flex items-center gap-2 text-emerald-50">
                <Zap size={13} fill="currentColor" className="text-lime-300" />
                {adBar.text}
              </p>
            )}
            {adBar.subtext && (
              <p className="flex items-center gap-2 text-emerald-100/70">
                <MapPin size={13} /> {adBar.subtext}
              </p>
            )}
          </div>
          {/* Mobile: infinite horizontal marquee loop */}
          <div className="sm:hidden flex min-h-8 items-center overflow-hidden">
            <div className="promo-marquee flex w-max">
              <PromoStrip items={[adBar.text, adBar.subtext].filter(Boolean)} />
              <PromoStrip items={[adBar.text, adBar.subtext].filter(Boolean)} />
            </div>
          </div>
        </div>
      )}

      {/* Sticky navbar — only this stays pinned on scroll */}
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/95 backdrop-blur-xl">
      <div className="container-wide">
        {/* Main row — tighter height on mobile */}
        <div className="flex min-h-[60px] items-center gap-2 sm:min-h-[76px] sm:gap-3 lg:gap-7">
          {/* Logo — icon only on xs, full lockup from sm */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#153d2b] text-white shadow-md shadow-emerald-950/15 sm:h-11 sm:w-11">
              <Leaf size={18} className="sm:hidden" />
              <Leaf size={22} className="hidden sm:block" />
            </span>
            <span className="hidden sm:block">
              <strong className="block font-sans text-[17px] font-black leading-tight tracking-tight text-stone-900">
                Organic Store
              </strong>
              <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-emerald-700">
                Farm to door
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `flex min-h-12 items-center rounded-xl px-4 text-sm font-bold transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-stone-600 hover:bg-stone-50 hover:text-emerald-800"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Search — desktop */}
          <form
            onSubmit={search}
            className="relative ml-auto hidden max-w-md flex-1 md:block"
          >
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
              size={18}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm font-semibold outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="Search apples, honey, spinach..."
            />
          </form>

          {/* Right icons */}
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            {/* Wishlist — hidden on xs, shown sm+ */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-stone-600 transition hover:bg-rose-50 hover:text-rose-600 sm:flex sm:h-12 sm:w-12"
            >
              <Heart size={20} />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label="Shopping cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 transition hover:bg-emerald-100 sm:h-12 sm:w-12"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-black text-amber-950 ring-2 ring-white sm:right-1.5 sm:top-1.5 sm:h-5 sm:min-w-5">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Profile — sm+ only */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex h-12 items-center gap-2 rounded-xl px-2.5 text-stone-600 transition hover:bg-stone-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-emerald-800">
                  <UserRound size={18} />
                </span>
                <span className="hidden text-left xl:block">
                  <span className="block text-[10px] font-semibold text-stone-400">
                    {isLoggedIn ? "Welcome back" : "Your account"}
                  </span>
                  <span className="block max-w-24 truncate text-xs font-extrabold text-stone-800">
                    {isLoggedIn ? user?.name : "Sign in"}
                  </span>
                </span>
                <ChevronDown size={14} className="hidden text-stone-400 xl:block" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl">
                  {isLoggedIn ? (
                    <>
                      <Link
                        to="/account"
                        onClick={() => setProfileOpen(false)}
                        className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold text-stone-600 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        <UserRound size={17} />
                        My account
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setProfileOpen(false)}
                        className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold text-stone-600 hover:bg-stone-50"
                      >
                        <Heart size={17} /> Wishlist
                      </Link>
                      <button
                        onClick={signOut}
                        className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut size={17} /> Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setProfileOpen(false)}
                        className="flex min-h-12 items-center gap-3 rounded-xl bg-[#153d2b] px-3 text-sm font-bold text-white"
                      >
                        <UserRound size={17} /> Customer sign in
                      </Link>
                      <Link
                        to="/admin/login"
                        onClick={() => setProfileOpen(false)}
                        className="mt-1 flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold text-stone-600 hover:bg-stone-50"
                      >
                        Admin portal
                      </Link>
                    </>
                  )}
                  </div>
                </>
              )}
            </div>

            {/* Hamburger — shown up to lg */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#153d2b] text-white lg:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* Mobile menu - premium slide-over drawer (portaled to body so the header's
            backdrop-blur can't trap/collapse the fixed drawer) */}
        {menuOpen && createPortal((
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 z-50 w-[300px] bg-[#fbfcf9] shadow-2xl flex flex-col lg:hidden animate-in slide-in-from-right duration-250">
              {/* Drawer Header */}
              <div className="bg-[#153d2b] text-white px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
                    <Leaf size={16} />
                  </span>
                  <span className="text-sm font-black tracking-tight">Organic Store</span>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Search */}
                  <form onSubmit={search} className="relative md:hidden">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-4 text-xs font-semibold outline-none focus:border-emerald-500 focus:bg-white transition"
                      placeholder="Search fresh groceries..."
                    />
                  </form>

                  {/* Links */}
                  <nav className="grid gap-1">
                    {links.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs font-black text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                        {link.label}
                      </Link>
                    ))}
                    <div className="h-px bg-stone-100 my-2" />
                    <Link
                      to="/wishlist"
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs font-black text-stone-700 hover:bg-rose-50 hover:text-rose-600 transition"
                    >
                      <Heart size={14} className="text-rose-500" />
                      Wishlist
                    </Link>
                    <Link
                      to={isLoggedIn ? "/account" : "/login"}
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs font-black text-emerald-800 hover:bg-emerald-50 transition"
                    >
                      <UserRound size={14} className="text-emerald-700" />
                      {isLoggedIn ? "My account" : "Sign in / Register"}
                    </Link>
                  </nav>
                </div>

                {/* Footer of Drawer */}
                {isLoggedIn && (
                  <button
                    onClick={() => { signOut(); setMenuOpen(false); }}
                    className="mt-6 flex min-h-11 w-full items-center gap-3 rounded-xl bg-rose-50 px-3 text-left text-xs font-black text-rose-600 hover:bg-rose-100 transition"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                )}
              </div>
            </div>
          </>
        ), document.body)}
      </div>
      </header>

      <style>{`
        @keyframes promoScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .promo-marquee { animation: promoScroll 18s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .promo-marquee { animation: none; }
        }
      `}</style>
    </>
  );
}