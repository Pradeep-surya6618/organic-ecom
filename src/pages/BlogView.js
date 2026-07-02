import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Home, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { blogAPI } from "../services/api";

export default function BlogView() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    (async () => {
      try {
        const res = await blogAPI.getBySlug(slug);
        if (!cancelled) setBlog(res?.data || null);
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

  if (notFound || !blog) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-black text-stone-900 mb-2">Story not found</h1>
        <Link to="/" className="inline-flex items-center gap-2 bg-[#153d2b] text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-emerald-800 transition mt-4">
          <ArrowLeft size={14} /> Back to home
        </Link>
      </div>
    );
  }

  const date = new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <nav className="flex items-center gap-2 text-xs font-semibold text-stone-400 mb-6">
        <Link to="/" className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 transition-colors">
          <Home size={12} /> Home
        </Link>
        <ChevronRight size={10} />
        <span className="text-stone-600 truncate">{blog.title}</span>
      </nav>

      {blog.imageUrl && (
        <img src={blog.imageUrl} alt={blog.title} className="w-full h-60 sm:h-80 object-cover rounded-3xl mb-8 border border-stone-100" />
      )}

      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-emerald-700 mb-3">
        {blog.category && <span>{blog.category}</span>}
        {blog.category && <span className="text-stone-300">·</span>}
        <span className="text-stone-400">{date}</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4">{blog.title}</h1>

      {blog.excerpt && <p className="text-lg text-stone-500 font-semibold mb-6">{blog.excerpt}</p>}

      <div className="text-stone-600 text-[15px] leading-relaxed whitespace-pre-line">{blog.content}</div>
    </div>
  );
}
