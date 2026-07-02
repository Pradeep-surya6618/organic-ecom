import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Home, ChevronRight, Loader2 } from "lucide-react";
import { pageAPI } from "../services/api";

// Renders any editable content page (About, FAQ, Shipping, Returns, Privacy, Terms).
// `slug` can be passed as a prop (e.g. /about) or comes from the URL (/page/:slug).
export default function PageView({ slug: slugProp }) {
  const params = useParams();
  const slug = slugProp || params.slug;

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    (async () => {
      try {
        const res = await pageAPI.getBySlug(slug);
        if (!cancelled) setPage(res?.data || null);
      } catch (e) {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-stone-400">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-black text-stone-900 mb-2">Page not found</h1>
        <p className="text-stone-500 text-sm mb-5">This page doesn't exist yet.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-[#153d2b] text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-emerald-800 transition">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-stone-400 mb-6">
        <Link to="/" className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 transition-colors">
          <Home size={12} /> Home
        </Link>
        <ChevronRight size={10} />
        <span className="text-stone-600">{page.title}</span>
      </nav>

      {page.imageUrl && (
        <img
          src={page.imageUrl}
          alt={page.title}
          className="w-full h-56 sm:h-72 object-cover rounded-3xl mb-8 border border-stone-100"
        />
      )}

      <h1 className="text-3xl sm:text-4xl font-black text-stone-900 mb-6">{page.title}</h1>

      {/* Plain-text body — line breaks preserved */}
      <div className="text-stone-600 text-[15px] leading-relaxed whitespace-pre-line">
        {page.body}
      </div>
    </div>
  );
}
