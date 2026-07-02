import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { BookOpen, Plus, Edit, X, Trash2, FileText, Upload, Utensils } from "lucide-react";
import { adminPageAPI, adminRecipeAPI, adminBlogAPI, heroAPI, adminHeroAPI } from "../../services/api";
import { HERO_DEFAULTS } from "../../components/HeroSlider";
import useConfirm from "../../components/ConfirmDialog";
import AdBarEditor from "../../components/admin/AdBarEditor";

const EMPTY_RECIPE = {
  title: "", description: "", imageUrl: "", prepTime: "", servings: "", calories: "",
  difficulty: "Easy", ingredients: [{ name: "", note: "" }], steps: [""],
};

const EMPTY_BLOG = { title: "", excerpt: "", content: "", category: "", tags: "", imageUrl: "", isPublished: true };

export default function AdminContent() {
  const { confirm, confirmDialog } = useConfirm();
  const [activeTab, setActiveTab] = useState("content");

  // Editable pages state
  const [pages, setPages] = useState([]);
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [pageForm, setPageForm] = useState({ title: "", body: "", imageUrl: "" });

  // Recipes state
  const [recipes, setRecipes] = useState([]);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [recipeForm, setRecipeForm] = useState(EMPTY_RECIPE);

  // Blogs state
  const [blogs, setBlogs] = useState([]);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [blogForm, setBlogForm] = useState(EMPTY_BLOG);

  // Home hero state
  const [heroForm, setHeroForm] = useState(HERO_DEFAULTS);

  /* ── Editable pages ── */
  const fetchPages = async () => {
    try {
      const res = await adminPageAPI.getAll();
      setPages(res?.data || []);
    } catch (e) {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const openEditPage = (page) => {
    setEditingPage(page);
    setPageForm({ title: page.title || "", body: page.body || "", imageUrl: page.imageUrl || "" });
    setShowPageModal(true);
  };

  const handlePageImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (file.size > 2 * 1024 * 1024) return toast.error("Image too large (max 2 MB)");
    const reader = new FileReader();
    reader.onload = () => setPageForm((f) => ({ ...f, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const handlePageSave = async (e) => {
    e.preventDefault();
    if (!pageForm.title.trim()) return toast.error("Title is required");
    try {
      await adminPageAPI.update(editingPage.slug, {
        title: pageForm.title,
        body: pageForm.body,
        imageUrl: pageForm.imageUrl,
      });
      toast.success("Page updated");
      setShowPageModal(false);
      fetchPages();
    } catch (err) {
      toast.error(err?.message || "Failed to save page");
    }
  };

  /* ── Recipes ── */
  const fetchRecipes = async () => {
    try {
      const res = await adminRecipeAPI.getAll();
      setRecipes(res?.data || []);
    } catch (e) {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const openAddRecipe = () => {
    setEditingRecipeId(null);
    setRecipeForm({ ...EMPTY_RECIPE, ingredients: [{ name: "", note: "" }], steps: [""] });
    setShowRecipeModal(true);
  };

  const openEditRecipe = (r) => {
    setEditingRecipeId(r._id);
    setRecipeForm({
      title: r.title || "", description: r.description || "", imageUrl: r.imageUrl || "",
      prepTime: r.prepTime || "", servings: r.servings || "", calories: r.calories || "",
      difficulty: r.difficulty || "Easy",
      ingredients: r.ingredients?.length ? r.ingredients.map((i) => ({ name: i.name || "", note: i.note || "" })) : [{ name: "", note: "" }],
      steps: r.steps?.length ? [...r.steps] : [""],
    });
    setShowRecipeModal(true);
  };

  const handleRecipeImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (file.size > 2 * 1024 * 1024) return toast.error("Image too large (max 2 MB)");
    const reader = new FileReader();
    reader.onload = () => setRecipeForm((f) => ({ ...f, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const setIngredient = (idx, key, val) =>
    setRecipeForm((f) => { const ing = [...f.ingredients]; ing[idx] = { ...ing[idx], [key]: val }; return { ...f, ingredients: ing }; });
  const addIngredient = () => setRecipeForm((f) => ({ ...f, ingredients: [...f.ingredients, { name: "", note: "" }] }));
  const removeIngredient = (idx) => setRecipeForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }));
  const setStep = (idx, val) => setRecipeForm((f) => { const s = [...f.steps]; s[idx] = val; return { ...f, steps: s }; });
  const addStep = () => setRecipeForm((f) => ({ ...f, steps: [...f.steps, ""] }));
  const removeStep = (idx) => setRecipeForm((f) => ({ ...f, steps: f.steps.filter((_, i) => i !== idx) }));

  const handleRecipeSave = async (e) => {
    e.preventDefault();
    if (!recipeForm.title.trim()) return toast.error("Title is required");
    const payload = {
      ...recipeForm,
      ingredients: recipeForm.ingredients.filter((i) => i.name.trim()),
      steps: recipeForm.steps.filter((s) => s.trim()),
    };
    try {
      if (editingRecipeId) {
        await adminRecipeAPI.update(editingRecipeId, payload);
        toast.success("Recipe updated");
      } else {
        await adminRecipeAPI.create(payload);
        toast.success("Recipe created");
      }
      setShowRecipeModal(false);
      fetchRecipes();
    } catch (err) {
      toast.error(err?.message || "Failed to save recipe");
    }
  };

  const handleDeleteRecipe = async (id) => {
    if (!(await confirm({
      title: "Delete recipe?",
      message: "This recipe will be permanently removed from the store.",
      confirmLabel: "Delete recipe",
    }))) return;
    try {
      await adminRecipeAPI.remove(id);
      toast.success("Recipe deleted");
      fetchRecipes();
    } catch (err) {
      toast.error(err?.message || "Failed to delete recipe");
    }
  };

  /* ── Blogs ── */
  const fetchBlogs = async () => {
    try {
      const res = await adminBlogAPI.getAll();
      setBlogs(res?.data?.blogs || res?.data || []);
    } catch (e) {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openAddBlog = () => {
    setEditingBlogId(null);
    setBlogForm({ ...EMPTY_BLOG });
    setShowBlogModal(true);
  };

  const openEditBlog = (b) => {
    setEditingBlogId(b._id);
    setBlogForm({
      title: b.title || "", excerpt: b.excerpt || "", content: b.content || "",
      category: b.category || "", tags: (b.tags || []).join(", "),
      imageUrl: b.imageUrl || "", isPublished: !!b.isPublished,
    });
    setShowBlogModal(true);
  };

  const handleBlogImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (file.size > 2 * 1024 * 1024) return toast.error("Image too large (max 2 MB)");
    const reader = new FileReader();
    reader.onload = () => setBlogForm((f) => ({ ...f, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleBlogSave = async (e) => {
    e.preventDefault();
    if (!blogForm.title.trim()) return toast.error("Title is required");
    const payload = {
      title: blogForm.title, excerpt: blogForm.excerpt, content: blogForm.content,
      category: blogForm.category, imageUrl: blogForm.imageUrl, isPublished: blogForm.isPublished,
      tags: blogForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editingBlogId) {
        await adminBlogAPI.update(editingBlogId, payload);
        toast.success("Blog updated");
      } else {
        await adminBlogAPI.create(payload);
        toast.success("Blog created");
      }
      setShowBlogModal(false);
      fetchBlogs();
    } catch (err) {
      toast.error(err?.message || "Failed to save blog");
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!(await confirm({
      title: "Delete blog?",
      message: "This blog post will be permanently removed from the store.",
      confirmLabel: "Delete blog",
    }))) return;
    try {
      await adminBlogAPI.remove(id);
      toast.success("Blog deleted");
      fetchBlogs();
    } catch (err) {
      toast.error(err?.message || "Failed to delete blog");
    }
  };

  /* ── Home hero ── */
  const fetchHero = async () => {
    try {
      const res = await heroAPI.get();
      if (res?.data) setHeroForm({ ...HERO_DEFAULTS, ...res.data });
    } catch (e) {
      /* keep defaults */
    }
  };

  useEffect(() => {
    fetchHero();
  }, []);

  const handleHeroImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (file.size > 2 * 1024 * 1024) return toast.error("Image too large (max 2 MB)");
    const reader = new FileReader();
    reader.onload = () => setHeroForm((f) => ({ ...f, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const setHeroField = (key, val) => setHeroForm((f) => ({ ...f, [key]: val }));

  const handleHeroSave = async (e) => {
    e.preventDefault();
    try {
      await adminHeroAPI.update(heroForm);
      toast.success("Hero section updated");
    } catch (err) {
      toast.error(err?.message || "Failed to save hero");
    }
  };

  const heroInput = "w-full h-11 border border-stone-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600";

  return (
    <div className="space-y-6">
      {confirmDialog}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-stone-900">Content manager</h2>
          <p className="text-xs font-medium text-stone-500 mt-1">Keep promotional campaigns, stories and pages fresh.</p>
        </div>
        {activeTab === "recipes" && (
          <button
            onClick={openAddRecipe}
            className="self-end sm:self-auto inline-flex items-center gap-2 bg-[#153d2b] hover:bg-emerald-800 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer"
          >
            <Plus size={16} />
            <span>New recipe</span>
          </button>
        )}
        {activeTab === "blogs" && (
          <button
            onClick={openAddBlog}
            className="self-end sm:self-auto inline-flex items-center gap-2 bg-[#153d2b] hover:bg-emerald-800 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer"
          >
            <Plus size={16} />
            <span>New blog</span>
          </button>
        )}
      </div>

      {/* Tabs — horizontally scrollable on mobile */}
      <div className="flex items-center gap-2 bg-stone-100/80 border border-stone-200/40 rounded-xl p-1 overflow-x-auto scrollbar-none">
        {[{ id: "content", label: "Banners" }, { id: "hero", label: "Hero" }, { id: "blogs", label: "Blogs" }, { id: "recipes", label: "Recipes" }, { id: "pages", label: "Pages" }].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`shrink-0 whitespace-nowrap px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === t.id ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "content" && <AdBarEditor />}

      {activeTab === "pages" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pages.length === 0 && (
            <p className="text-sm font-bold text-stone-400 py-6">No pages found.</p>
          )}
          {pages.map((p) => (
            <div key={p.slug} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="h-10 w-10 shrink-0 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400">
                  <FileText size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black text-stone-900 truncate">{p.title}</p>
                  <p className="text-[10px] text-stone-400 font-bold">/page/{p.slug}</p>
                </div>
              </div>
              <button
                onClick={() => openEditPage(p)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-250 hover:border-emerald-300 hover:bg-emerald-50 text-stone-700 hover:text-[#153d2b] text-[10px] font-black transition cursor-pointer shrink-0"
              >
                <Edit size={12} /> Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "hero" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm max-w-2xl mx-auto">
          <p className="text-xs font-medium text-stone-500 mb-4">Edit the homepage hero section. Changes appear on the storefront home page.</p>
          <form onSubmit={handleHeroSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-stone-400">Badge text</label>
              <input type="text" value={heroForm.badge} onChange={(e) => setHeroField("badge", e.target.value)} className={heroInput} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-stone-400">Heading</label><input type="text" value={heroForm.heading} onChange={(e) => setHeroField("heading", e.target.value)} className={heroInput} /></div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-stone-400">Heading accent (2nd line)</label><input type="text" value={heroForm.headingAccent} onChange={(e) => setHeroField("headingAccent", e.target.value)} className={heroInput} /></div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-stone-400">Subtext</label>
              <textarea rows="3" value={heroForm.subtext} onChange={(e) => setHeroField("subtext", e.target.value)} className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-600 resize-y" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-stone-400">Hero image</label>
              <div className="flex items-center gap-3">
                <div className="h-16 w-24 shrink-0 rounded-xl border border-stone-200 bg-stone-50 overflow-hidden flex items-center justify-center text-lg">
                  {heroForm.imageUrl ? <img src={heroForm.imageUrl} alt="preview" className="h-full w-full object-cover" /> : "🖼️"}
                </div>
                <div className="flex-1 space-y-2">
                  <input type="text" placeholder="Image URL" value={heroForm.imageUrl?.startsWith("data:") ? "" : heroForm.imageUrl} onChange={(e) => setHeroField("imageUrl", e.target.value)} className="w-full h-9 border border-stone-200 rounded-lg px-3 text-xs font-semibold outline-none focus:border-emerald-600" />
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-black cursor-pointer transition">
                    <Upload size={12} /> Upload (max 2 MB)
                    <input type="file" accept="image/*" onChange={handleHeroImageFile} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-stone-400">Primary button text</label><input type="text" value={heroForm.primaryCtaText} onChange={(e) => setHeroField("primaryCtaText", e.target.value)} className={heroInput} /></div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-stone-400">Primary button link</label><input type="text" value={heroForm.primaryCtaLink} onChange={(e) => setHeroField("primaryCtaLink", e.target.value)} className={heroInput} /></div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-stone-400">Secondary button text</label><input type="text" value={heroForm.secondaryCtaText} onChange={(e) => setHeroField("secondaryCtaText", e.target.value)} className={heroInput} /></div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-stone-400">Secondary button link</label><input type="text" value={heroForm.secondaryCtaLink} onChange={(e) => setHeroField("secondaryCtaLink", e.target.value)} className={heroInput} /></div>
            </div>
            <div className="pt-2">
              <button type="submit" className="h-11 px-6 rounded-xl bg-[#153d2b] hover:bg-emerald-800 text-white text-xs font-extrabold transition shadow-lg">Save Hero</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "blogs" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {blogs.length === 0 && <p className="text-sm font-bold text-stone-400 py-6">No blogs yet.</p>}
          {blogs.map((b) => (
            <div key={b._id} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-stone-50 flex items-center justify-center">
                {b.imageUrl ? <img src={b.imageUrl} alt={b.title} className="h-full w-full object-cover" /> : <BookOpen size={20} className="text-stone-300" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-black text-stone-900 truncate">{b.title}</p>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${b.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{b.isPublished ? "Live" : "Draft"}</span>
                </div>
                <p className="text-[10px] text-stone-400 font-bold mt-0.5">{b.category || "—"}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEditBlog(b)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 text-stone-500 hover:text-[#153d2b] transition cursor-pointer">
                  <Edit size={13} />
                </button>
                <button onClick={() => handleDeleteBlog(b._id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 hover:border-red-300 hover:bg-red-50 text-stone-500 hover:text-red-600 transition cursor-pointer">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "recipes" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {recipes.length === 0 && <p className="text-sm font-bold text-stone-400 py-6">No recipes yet.</p>}
          {recipes.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-stone-50 flex items-center justify-center">
                {r.imageUrl ? <img src={r.imageUrl} alt={r.title} className="h-full w-full object-cover" /> : <Utensils size={20} className="text-stone-300" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-stone-900 truncate">{r.title}</p>
                <p className="text-[10px] text-stone-400 font-bold mt-0.5">{r.difficulty} · {r.prepTime} · {r.ingredients?.length || 0} ingredients</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEditRecipe(r)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 text-stone-500 hover:text-[#153d2b] transition cursor-pointer">
                  <Edit size={13} />
                </button>
                <button onClick={() => handleDeleteRecipe(r._id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 hover:border-red-300 hover:bg-red-50 text-stone-500 hover:text-red-600 transition cursor-pointer">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {createPortal(
        <>
      {/* ── EDIT PAGE MODAL ── */}
      {showPageModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-stone-950/40 backdrop-blur-sm px-4 py-6">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4 my-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-black text-stone-900">Edit page — /page/{editingPage?.slug}</h3>
              <button onClick={() => setShowPageModal(false)} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePageSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-stone-400">Title</label>
                <input
                  type="text"
                  value={pageForm.title}
                  onChange={(e) => setPageForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full h-11 border border-stone-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-stone-400">Body (plain text — line breaks preserved)</label>
                <textarea
                  rows="9"
                  value={pageForm.body}
                  onChange={(e) => setPageForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="Page content..."
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-600 resize-y"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-stone-400">Image (optional)</label>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 rounded-xl border border-stone-200 bg-stone-50 overflow-hidden flex items-center justify-center text-lg">
                    {pageForm.imageUrl ? <img src={pageForm.imageUrl} alt="preview" className="h-full w-full object-cover" /> : "🖼️"}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={pageForm.imageUrl.startsWith("data:") ? "" : pageForm.imageUrl}
                      onChange={(e) => setPageForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      className="w-full h-9 border border-stone-200 rounded-lg px-3 text-xs font-semibold outline-none focus:border-emerald-600"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-black cursor-pointer transition">
                      <Upload size={12} /> Upload (max 2 MB)
                      <input type="file" accept="image/*" onChange={handlePageImageFile} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowPageModal(false)}
                  className="flex-1 h-11 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-extrabold text-stone-600 transition">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#153d2b] hover:bg-emerald-800 text-white text-xs font-extrabold transition shadow-lg">
                  Save Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── RECIPE MODAL ── */}
      {showRecipeModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-stone-950/40 backdrop-blur-sm px-4 py-6">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4 my-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-black text-stone-900">{editingRecipeId ? "Edit Recipe" : "New Recipe"}</h3>
              <button onClick={() => setShowRecipeModal(false)} className="text-stone-400 hover:text-stone-700"><X size={18} /></button>
            </div>

            <form onSubmit={handleRecipeSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-stone-400">Title</label>
                <input type="text" value={recipeForm.title} onChange={(e) => setRecipeForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full h-11 border border-stone-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-stone-400">Description</label>
                <textarea rows="3" value={recipeForm.description} onChange={(e) => setRecipeForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-600 resize-y" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-stone-400">Image</label>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 rounded-xl border border-stone-200 bg-stone-50 overflow-hidden flex items-center justify-center text-lg">
                    {recipeForm.imageUrl ? <img src={recipeForm.imageUrl} alt="preview" className="h-full w-full object-cover" /> : "🖼️"}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input type="text" placeholder="Image URL" value={recipeForm.imageUrl.startsWith("data:") ? "" : recipeForm.imageUrl}
                      onChange={(e) => setRecipeForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      className="w-full h-9 border border-stone-200 rounded-lg px-3 text-xs font-semibold outline-none focus:border-emerald-600" />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-black cursor-pointer transition">
                      <Upload size={12} /> Upload (max 2 MB)
                      <input type="file" accept="image/*" onChange={handleRecipeImageFile} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-stone-400">Prep time</label><input type="text" placeholder="10 mins" value={recipeForm.prepTime} onChange={(e) => setRecipeForm((f) => ({ ...f, prepTime: e.target.value }))} className="w-full h-10 border border-stone-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-stone-400">Servings</label><input type="text" placeholder="2" value={recipeForm.servings} onChange={(e) => setRecipeForm((f) => ({ ...f, servings: e.target.value }))} className="w-full h-10 border border-stone-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-stone-400">Calories</label><input type="text" placeholder="320 kcal" value={recipeForm.calories} onChange={(e) => setRecipeForm((f) => ({ ...f, calories: e.target.value }))} className="w-full h-10 border border-stone-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-stone-400">Difficulty</label><select value={recipeForm.difficulty} onChange={(e) => setRecipeForm((f) => ({ ...f, difficulty: e.target.value }))} className="w-full h-10 border border-stone-200 bg-white rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600"><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-stone-400">Ingredients (name matches a product)</label>
                  <button type="button" onClick={addIngredient} className="text-[10px] font-black text-emerald-700 hover:text-emerald-900">+ Add</button>
                </div>
                {recipeForm.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" placeholder="Product name" value={ing.name} onChange={(e) => setIngredient(idx, "name", e.target.value)} className="flex-1 min-w-0 h-9 border border-stone-200 rounded-lg px-2 text-[11px] font-semibold outline-none focus:border-emerald-600" />
                    <input type="text" placeholder="Note (optional)" value={ing.note} onChange={(e) => setIngredient(idx, "note", e.target.value)} className="flex-1 min-w-0 h-9 border border-stone-200 rounded-lg px-2 text-[11px] font-semibold outline-none focus:border-emerald-600" />
                    <button type="button" onClick={() => removeIngredient(idx)} className="h-9 w-9 shrink-0 rounded-lg border border-stone-200 text-stone-400 hover:text-red-600 hover:border-red-300 flex items-center justify-center"><X size={12} /></button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-stone-400">Steps</label>
                  <button type="button" onClick={addStep} className="text-[10px] font-black text-emerald-700 hover:text-emerald-900">+ Add</button>
                </div>
                {recipeForm.steps.map((s, idx) => (
                  <div key={idx} className="flex gap-2">
                    <textarea rows="2" placeholder={`Step ${idx + 1}`} value={s} onChange={(e) => setStep(idx, e.target.value)} className="flex-1 min-w-0 border border-stone-200 rounded-lg px-2 py-1.5 text-[11px] font-semibold outline-none focus:border-emerald-600 resize-y" />
                    <button type="button" onClick={() => removeStep(idx)} className="h-9 w-9 shrink-0 rounded-lg border border-stone-200 text-stone-400 hover:text-red-600 hover:border-red-300 flex items-center justify-center self-start"><X size={12} /></button>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowRecipeModal(false)} className="flex-1 h-11 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-extrabold text-stone-600 transition">Cancel</button>
                <button type="submit" className="flex-1 h-11 rounded-xl bg-[#153d2b] hover:bg-emerald-800 text-white text-xs font-extrabold transition shadow-lg">{editingRecipeId ? "Save Recipe" : "Create Recipe"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── BLOG MODAL ── */}
      {showBlogModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-stone-950/40 backdrop-blur-sm px-4 py-6">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4 my-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-black text-stone-900">{editingBlogId ? "Edit Blog" : "New Blog"}</h3>
              <button onClick={() => setShowBlogModal(false)} className="text-stone-400 hover:text-stone-700"><X size={18} /></button>
            </div>

            <form onSubmit={handleBlogSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-stone-400">Title</label>
                <input type="text" value={blogForm.title} onChange={(e) => setBlogForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full h-11 border border-stone-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-stone-400">Excerpt (short summary)</label>
                <input type="text" value={blogForm.excerpt} onChange={(e) => setBlogForm((f) => ({ ...f, excerpt: e.target.value }))}
                  className="w-full h-11 border border-stone-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-stone-400">Content</label>
                <textarea rows="8" value={blogForm.content} onChange={(e) => setBlogForm((f) => ({ ...f, content: e.target.value }))}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-600 resize-y" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-stone-400">Category</label><input type="text" placeholder="Wellness" value={blogForm.category} onChange={(e) => setBlogForm((f) => ({ ...f, category: e.target.value }))} className="w-full h-10 border border-stone-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-stone-400">Tags (comma-sep)</label><input type="text" placeholder="organic, tips" value={blogForm.tags} onChange={(e) => setBlogForm((f) => ({ ...f, tags: e.target.value }))} className="w-full h-10 border border-stone-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600" /></div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-stone-400">Cover image</label>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 rounded-xl border border-stone-200 bg-stone-50 overflow-hidden flex items-center justify-center text-lg">
                    {blogForm.imageUrl ? <img src={blogForm.imageUrl} alt="preview" className="h-full w-full object-cover" /> : "🖼️"}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input type="text" placeholder="Image URL" value={blogForm.imageUrl.startsWith("data:") ? "" : blogForm.imageUrl}
                      onChange={(e) => setBlogForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      className="w-full h-9 border border-stone-200 rounded-lg px-3 text-xs font-semibold outline-none focus:border-emerald-600" />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-black cursor-pointer transition">
                      <Upload size={12} /> Upload (max 2 MB)
                      <input type="file" accept="image/*" onChange={handleBlogImageFile} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                <input type="checkbox" checked={blogForm.isPublished} onChange={(e) => setBlogForm((f) => ({ ...f, isPublished: e.target.checked }))} />
                Published (visible on the storefront)
              </label>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowBlogModal(false)} className="flex-1 h-11 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-extrabold text-stone-600 transition">Cancel</button>
                <button type="submit" className="flex-1 h-11 rounded-xl bg-[#153d2b] hover:bg-emerald-800 text-white text-xs font-extrabold transition shadow-lg">{editingBlogId ? "Save Blog" : "Create Blog"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>,
        document.body
      )}
    </div>
  );
}
