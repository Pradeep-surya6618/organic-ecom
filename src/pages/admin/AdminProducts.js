import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, Search, X, Eye, EyeOff, Upload } from "lucide-react";
import { useProducts } from "../../context/ProductContext";

const BADGE_OPTIONS = ["Best Seller", "Sale", "Popular", "Premium", "Seasonal"];

// Up to 3 images (URL or file upload → base64, max 2 MB each) with a selectable
// main image, plus the Badge field. Shared by the add/edit modals.
function ImageBadgeFields({ formImages, setFormImages, formMainIndex, setFormMainIndex, formBadge, setFormBadge }) {
  const setImageAt = (idx, val) => {
    setFormImages((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleFile = (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (file.size > 2 * 1024 * 1024) return toast.error("Image too large (max 2 MB)");
    const reader = new FileReader();
    reader.onload = () => setImageAt(idx, reader.result);
    reader.onerror = () => toast.error("Could not read the image");
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-stone-400">
          Product Images (up to 3) — pick the main
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((idx) => {
            const img = formImages[idx] || "";
            const isMain = formMainIndex === idx && !!img;
            return (
              <div key={idx} className="space-y-1.5">
                <div className={`relative h-20 rounded-xl border-2 overflow-hidden flex items-center justify-center text-lg bg-stone-50 ${isMain ? "border-emerald-600" : "border-stone-200"}`}>
                  {img ? <img src={img} alt={`img ${idx + 1}`} className="h-full w-full object-cover" /> : <span className="text-stone-300">🖼️</span>}
                  {isMain && (
                    <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[8px] font-black text-center py-0.5">MAIN</span>
                  )}
                  {img && (
                    <button type="button" onClick={() => setImageAt(idx, "")}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/50 text-white flex items-center justify-center">
                      <X size={11} />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={img.startsWith("data:") ? "" : img}
                  onChange={(e) => setImageAt(idx, e.target.value)}
                  className="w-full h-8 border border-stone-200 rounded-lg px-2 text-[10px] font-semibold outline-none focus:border-emerald-600"
                />
                <label className="flex items-center justify-center gap-1 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-[9px] font-black cursor-pointer transition">
                  <Upload size={10} /> Upload
                  <input type="file" accept="image/*" onChange={(e) => handleFile(idx, e)} className="hidden" />
                </label>
                <label className={`flex items-center justify-center gap-1 text-[9px] font-black ${img ? "cursor-pointer text-stone-600" : "text-stone-300 cursor-not-allowed"}`}>
                  <input type="radio" name="mainImage" checked={isMain} disabled={!img} onChange={() => setFormMainIndex(idx)} />
                  Main
                </label>
              </div>
            );
          })}
        </div>
        <p className="text-[9px] text-stone-400 font-semibold">Max 2 MB per image. The main image is shown on cards and lists.</p>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase text-stone-400">Badge</label>
        <select
          value={formBadge}
          onChange={(e) => setFormBadge(e.target.value)}
          className="w-full h-11 border border-stone-200 bg-white rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600"
        >
          <option value="">None</option>
          {BADGE_OPTIONS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
    </>
  );
}

export default function AdminProducts() {
  const {
    adminProducts: products,
    categories,
    fetchAdminProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductVisibility
  } = useProducts();

  // Load every product (including hidden) from the backend on mount.
  useEffect(() => {
    fetchAdminProducts();
  }, [fetchAdminProducts]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Selected Product State for Edit/Delete
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("fruits");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formEmoji, setFormEmoji] = useState("📦");
  const [formImages, setFormImages] = useState(["", "", ""]);
  const [formMainIndex, setFormMainIndex] = useState(0);
  const [formBadge, setFormBadge] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [genLoading, setGenLoading] = useState(false);

  // Calculations for Stats
  const totalProductsCount = products.length;
  const inStockCount = products.filter(p => p.stock > 10).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  const handleOpenAdd = () => {
    setFormName("");
    setFormCategory(categories[0]?.slug || "fruits");
    setFormPrice("");
    setFormStock("");
    setFormEmoji("📦");
    setFormImages(["", "", ""]);
    setFormMainIndex(0);
    setFormBadge("");
    setFormDescription("");
    setShowAddModal(true);
  };

  // Generate a product description with the admin AI copilot.
  const generateDescription = async () => {
    if (!formName.trim()) {
      toast.error("Enter a product name first");
      return;
    }
    setGenLoading(true);
    try {
      const { adminAiAPI } = await import("../../services/api");
      const res = await adminAiAPI.productDescription({ name: formName, category: formCategory, price: formPrice });
      const desc = res?.data?.description;
      if (desc) {
        setFormDescription(desc);
        toast.success("Description generated ✨");
      } else {
        toast.error("Couldn't generate a description — try again");
      }
    } catch (err) {
      toast.error(err?.message || "AI is unavailable right now");
    } finally {
      setGenLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice || !formStock) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      await addProduct({
        name: formName,
        category: formCategory,
        price: parseFloat(formPrice),
        stock: parseInt(formStock),
        emoji: formEmoji,
        images: formImages,
        image: formImages[formMainIndex] || formImages.filter(Boolean)[0] || "",
        badge: formBadge,
        description: formDescription
      });
      setShowAddModal(false);
      toast.success(`"${formName}" added`);
    } catch (err) {
      toast.error(err?.message || "Failed to add product");
    }
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setFormName(product.name || "");
    setFormCategory(product.category || "fruits");
    setFormPrice((product.price !== undefined && product.price !== null) ? product.price.toString() : "0");
    setFormStock((product.stock !== undefined && product.stock !== null) ? product.stock.toString() : "0");
    setFormEmoji(product.emoji || "📦");
    const imgs = (product.images && product.images.length ? product.images : (product.image ? [product.image] : [])).slice(0, 3);
    const padded = [imgs[0] || "", imgs[1] || "", imgs[2] || ""];
    setFormImages(padded);
    const mainIdx = padded.findIndex((u) => u && u === product.image);
    setFormMainIndex(mainIdx >= 0 ? mainIdx : 0);
    setFormBadge(product.badge || "");
    setFormDescription(product.description || "");
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice || !formStock) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      await updateProduct(selectedProduct.id, {
        name: formName,
        category: formCategory,
        price: parseFloat(formPrice),
        stock: parseInt(formStock),
        emoji: formEmoji,
        images: formImages,
        image: formImages[formMainIndex] || formImages.filter(Boolean)[0] || "",
        badge: formBadge,
        description: formDescription
      });
      setShowEditModal(false);
      toast.success(`"${formName}" updated`);
    } catch (err) {
      toast.error(err?.message || "Failed to update product");
    }
  };

  const handleOpenDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    const name = selectedProduct?.name;
    try {
      await deleteProduct(selectedProduct.id);
      setShowDeleteModal(false);
      toast.success(`${name ? `"${name}"` : "Product"} deleted`);
    } catch (err) {
      toast.error(err?.message || "Failed to delete product");
    }
  };

  // Filter logic
  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    let matchesCategory = true;
    if (categoryFilter === "hidden") {
      matchesCategory = p.isHidden === true;
    } else if (categoryFilter !== "all") {
      matchesCategory = p.category === categoryFilter;
    }
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900">Product inventory</h2>
          <p className="text-xs font-medium text-stone-500 mt-1">Manage catalog listings and current stock levels.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-[#153d2b] hover:bg-emerald-800 text-white rounded-xl px-4 py-2.5 text-xs font-black transition shadow-lg shadow-emerald-900/10 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-2xl p-4 border border-stone-200/50 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-stone-400 text-[9px] font-black uppercase tracking-wider">Total Products</p>
            <p className="text-lg font-black text-stone-800 mt-1">{totalProductsCount}</p>
          </div>
          <span className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">📦</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-200/50 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-stone-400 text-[9px] font-black uppercase tracking-wider">In Stock</p>
            <p className="text-lg font-black text-emerald-700 mt-1">{inStockCount}</p>
          </div>
          <span className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">✓</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-200/50 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-stone-400 text-[9px] font-black uppercase tracking-wider">Low Stock</p>
            <p className="text-lg font-black text-amber-700 mt-1">{lowStockCount}</p>
          </div>
          <span className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">!</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-200/50 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-stone-400 text-[9px] font-black uppercase tracking-wider">Out of Stock</p>
            <p className="text-lg font-black text-red-600 mt-1">{outOfStockCount}</p>
          </div>
          <span className="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">✕</span>
        </div>
      </div>

      {/* Filter tabs and search */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex items-center flex-1 w-full bg-white rounded-2xl border border-stone-200 shadow-sm">
          <Search size={18} className="absolute left-4 text-stone-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name..."
            className="w-full h-11 bg-transparent pl-12 pr-4 text-xs font-bold text-stone-800 outline-none placeholder:text-stone-400"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center bg-stone-100/80 border border-stone-200/40 rounded-xl p-1 shrink-0 self-start md:self-auto">
          {["all", ...categories.map((c) => c.slug), "hidden"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-lg text-xs font-black capitalize transition-all ${
                categoryFilter === cat
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              {cat === "hidden" ? "hidden 👁️‍🗨️" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-3xl border border-stone-200/50 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/50 text-[10px] font-black uppercase text-stone-400 tracking-wider">
              <th className="px-6 py-4">Item</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock Level</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs font-bold text-stone-700">
            {filtered.map((product) => {
              const stockPct = Math.min((product.stock / 50) * 100, 100);
              return (
                <tr
                  key={product.id}
                  className={`hover:bg-stone-50/30 transition-colors ${
                    product.isHidden ? "opacity-60 bg-stone-50/50" : ""
                  }`}
                >
                  <td className="px-6 py-4 flex items-center gap-3">
                    <span className="h-10 w-10 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-xl overflow-hidden">
                      {product.image
                        ? <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        : (product.emoji || "📦")}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-extrabold text-stone-900">{product.name}</p>
                        {product.isHidden && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 mt-0.5">ID: #{product.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                      product.category === "fruits" ? "bg-orange-50 text-orange-700 border border-orange-100" :
                      "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    }`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-900">₹{product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 min-w-[150px]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] text-stone-400 font-extrabold">
                        <span>{product.stock > 0 ? `${product.stock} units` : "Out of stock"}</span>
                        <span>{Math.round(stockPct)}%</span>
                      </div>
                      <div className="w-24 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            product.stock > 10 ? "bg-emerald-500" :
                            product.stock > 0 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${stockPct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={async () => {
                        try {
                          await toggleProductVisibility(product.id);
                          toast.success(product.isHidden ? `"${product.name}" is now visible` : `"${product.name}" hidden`);
                        } catch (err) {
                          toast.error(err?.message || "Failed to update visibility");
                        }
                      }}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition cursor-pointer ${
                        product.isHidden
                          ? "border-amber-200 hover:border-amber-300 text-amber-500 hover:text-amber-700 bg-amber-50"
                          : "border-stone-200 hover:border-emerald-300 text-stone-400 hover:text-emerald-750 bg-white"
                      }`}
                      title={product.isHidden ? "Show product" : "Hide product"}
                    >
                      {product.isHidden ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 hover:border-emerald-300 text-stone-400 hover:text-emerald-750 bg-white transition cursor-pointer"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(product)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 hover:border-red-300 text-stone-400 hover:text-red-600 bg-white transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {createPortal(
        <>
      {/* ── ADD PRODUCT MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-stone-950/40 backdrop-blur-sm px-4 py-6">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4 my-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-black text-stone-950">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-stone-400">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Blueberries"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-11 border border-stone-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-stone-400">Description</label>
                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={genLoading}
                    className="inline-flex items-center gap-1 text-[10px] font-black text-[#153d2b] hover:text-emerald-700 disabled:opacity-50 transition cursor-pointer"
                  >
                    {genLoading ? "Generating…" : "✨ Generate with AI"}
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Short product description…"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-stone-400">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-11 border border-stone-200 bg-white rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-stone-400">Emoji icon</label>
                  <input
                    type="text"
                    required
                    value={formEmoji}
                    onChange={(e) => setFormEmoji(e.target.value)}
                    className="w-full h-11 border border-stone-200 rounded-xl px-3 text-xs font-semibold text-center outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-stone-400">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 4.99"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full h-11 border border-stone-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-stone-400">Stock qty</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 24"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full h-11 border border-stone-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <ImageBadgeFields formImages={formImages} setFormImages={setFormImages} formMainIndex={formMainIndex} setFormMainIndex={setFormMainIndex} formBadge={formBadge} setFormBadge={setFormBadge} />

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-11 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-extrabold text-stone-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#153d2b] hover:bg-emerald-800 text-white text-xs font-extrabold transition shadow-lg shadow-emerald-900/10"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT PRODUCT MODAL ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-stone-950/40 backdrop-blur-sm px-4 py-6">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4 my-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-black text-stone-955">Edit Product Info</h3>
              <button onClick={() => setShowEditModal(false)} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-stone-400">Product Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-11 border border-stone-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-stone-400">Description</label>
                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={genLoading}
                    className="inline-flex items-center gap-1 text-[10px] font-black text-[#153d2b] hover:text-emerald-700 disabled:opacity-50 transition cursor-pointer"
                  >
                    {genLoading ? "Generating…" : "✨ Generate with AI"}
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Short product description…"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-stone-400">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-11 border border-stone-200 bg-white rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-stone-400">Emoji icon</label>
                  <input
                    type="text"
                    required
                    value={formEmoji}
                    onChange={(e) => setFormEmoji(e.target.value)}
                    className="w-full h-11 border border-stone-200 rounded-xl px-3 text-xs font-semibold text-center outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-stone-400">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full h-11 border border-stone-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-stone-400">Stock qty</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full h-11 border border-stone-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <ImageBadgeFields formImages={formImages} setFormImages={setFormImages} formMainIndex={formMainIndex} setFormMainIndex={setFormMainIndex} formBadge={formBadge} setFormBadge={setFormBadge} />

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 h-11 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-extrabold text-stone-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#153d2b] hover:bg-emerald-800 text-white text-xs font-extrabold transition shadow-lg shadow-emerald-900/10"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE PRODUCT CONFIRMATION MODAL ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-stone-950/40 backdrop-blur-sm px-4 py-6">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={20} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-black text-stone-950">Remove Product?</h3>
              <p className="text-xs text-stone-400 font-bold">
                Are you sure you want to delete <span className="text-stone-850 font-black">"{selectedProduct?.name}"</span>? This action is permanent.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-11 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-extrabold text-stone-600 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition shadow-lg shadow-red-600/10"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
        </>,
        document.body
      )}

    </div>
  );
}
