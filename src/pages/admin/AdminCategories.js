import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { Tags, Plus, Edit, Trash2, X, Package, Loader2, RefreshCw } from "lucide-react";
import { adminCategoryAPI } from "../../services/api";
import { useProducts } from "../../context/ProductContext";
import useConfirm from "../../components/ConfirmDialog";

const EMPTY = { name: "", description: "", order: 0 };

export default function AdminCategories() {
  const { fetchCategories } = useProducts();
  const { confirm, confirmDialog } = useConfirm();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCategoryAPI.getAll();
      setCategories(res?.data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Keep scroll locked while the modal is open
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  const openAdd = () => { setEditingId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (c) => { setEditingId(c._id); setForm({ name: c.name || "", description: c.description || "", order: c.order || 0 }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Category name is required");
    setSaving(true);
    try {
      if (editingId) {
        await adminCategoryAPI.update(editingId, form);
        toast.success("Category updated");
      } else {
        await adminCategoryAPI.create(form);
        toast.success("Category created");
      }
      setShowModal(false);
      await load();
      fetchCategories?.();
    } catch (err) {
      toast.error(err?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c) => {
    if (c.productCount > 0) {
      // Proactively tell the admin it's blocked — the backend enforces this too.
      return toast.error(`"${c.name}" has ${c.productCount} linked product${c.productCount > 1 ? "s" : ""}. Reassign or remove them before deleting.`);
    }
    if (!(await confirm({
      title: "Delete category?",
      message: `"${c.name}" will be permanently removed. This can't be undone.`,
      confirmLabel: "Delete category",
    }))) return;
    try {
      await adminCategoryAPI.remove(c._id);
      toast.success("Category deleted");
      await load();
      fetchCategories?.();
    } catch (err) {
      // Backend returns a clear message if products are still linked
      toast.error(err?.message || "Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      {confirmDialog}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-stone-900">Categories</h2>
          <p className="text-xs font-medium text-stone-500 mt-1">Create and organise the categories used across products, shop and footer.</p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-stone-200 text-[11px] font-black text-stone-600 hover:bg-stone-50 transition cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-[#153d2b] hover:bg-emerald-800 text-white rounded-lg px-4 h-9 text-[11px] font-black transition cursor-pointer shadow-sm"
          >
            <Plus size={14} /> New Category
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-xs font-medium text-stone-400 py-12">Loading categories…</p>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-10 text-center">
          <Tags size={28} className="mx-auto text-stone-300" />
          <p className="text-sm font-black text-stone-700 mt-3">No categories yet</p>
          <p className="text-xs font-medium text-stone-400 mt-1">Create your first category to organise products.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c._id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-black text-stone-900 truncate">{c.name}</p>
                  <p className="text-[10px] font-bold text-stone-400 mt-0.5">/{c.slug}</p>
                </div>
                <span className="inline-flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg bg-stone-50 border border-stone-100 text-[10px] font-black text-stone-500">
                  <Package size={11} /> {c.productCount}
                </span>
              </div>

              {c.description && <p className="text-xs font-medium text-stone-500 line-clamp-2">{c.description}</p>}

              <div className="flex items-center gap-2 pt-2 mt-auto border-t border-stone-100">
                <button
                  onClick={() => openEdit(c)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 text-stone-700 hover:text-[#153d2b] text-[10px] font-black transition cursor-pointer"
                >
                  <Edit size={12} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  title={c.productCount > 0 ? `${c.productCount} product(s) linked — cannot delete` : "Delete category"}
                  className={`inline-flex items-center justify-center h-9 w-9 rounded-lg border transition cursor-pointer ${
                    c.productCount > 0
                      ? "border-stone-200 text-stone-300 hover:bg-stone-50"
                      : "border-stone-200 text-red-500 hover:border-red-300 hover:bg-red-50"
                  }`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[120] flex items-start sm:items-center justify-center overflow-y-auto bg-stone-950/60 backdrop-blur-sm p-4 py-6" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl my-auto animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-stone-900">{editingId ? "Edit Category" : "New Category"}</h3>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Fresh Fruits"
                  className="w-full h-11 rounded-xl border-2 border-stone-200 focus:border-emerald-600 outline-none px-4 text-xs font-bold text-stone-800 transition"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description (optional)"
                  rows={3}
                  className="w-full rounded-xl border-2 border-stone-200 focus:border-emerald-600 outline-none px-4 py-2.5 text-xs font-bold text-stone-800 transition resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Display Order</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                  className="w-full h-11 rounded-xl border-2 border-stone-200 focus:border-emerald-600 outline-none px-4 text-xs font-bold text-stone-800 transition"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="h-11 px-5 rounded-xl border border-stone-200 text-xs font-black text-stone-600 hover:bg-stone-50 transition cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="h-11 px-5 rounded-xl bg-[#153d2b] hover:bg-emerald-800 text-white text-xs font-black transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : (editingId ? "Save Changes" : "Create Category")}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
