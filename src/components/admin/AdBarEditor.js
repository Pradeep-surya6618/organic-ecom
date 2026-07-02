import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Zap, MapPin, Save, Loader2, Eye, Megaphone } from "lucide-react";
import { adminSiteSettingsAPI } from "../../services/api";

const DEFAULTS = {
  enabled: true,
  text: "Fresh groceries delivered in 10 minutes",
  subtext: "Delivering near you · 7am–11pm",
};

// One repeatable strip for the mobile marquee preview.
const Strip = ({ items }) => (
  <div className="flex shrink-0 items-center gap-6 pr-6 text-[11px] font-bold text-emerald-50">
    {items.map((it, i) => (
      <span key={i} className="flex items-center gap-1.5">
        {i % 2 === 0 ? <Zap size={12} fill="currentColor" className="text-lime-300" /> : <MapPin size={12} />}
        {it}
      </span>
    ))}
  </div>
);

export default function AdBarEditor() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    adminSiteSettingsAPI.getAdBar()
      .then((res) => { if (alive && res?.data) setForm({ ...DEFAULTS, ...res.data }); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminSiteSettingsAPI.updateAdBar(form);
      toast.success("Top ad bar saved");
    } catch (err) {
      toast.error(err?.message || "Failed to save ad bar");
    } finally {
      setSaving(false);
    }
  };

  const items = [form.text, form.subtext].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="h-9 w-9 rounded-xl bg-emerald-50 text-[#153d2b] flex items-center justify-center"><Megaphone size={17} /></span>
        <div>
          <h3 className="text-sm font-black text-stone-900">Top Ad Bar</h3>
          <p className="text-[11px] font-medium text-stone-400">The green announcement strip above the storefront navbar.</p>
        </div>
      </div>

      {/* Live preview */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-stone-400">
          <Eye size={12} /> Live Preview
        </div>

        {!form.enabled ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 text-stone-400 text-xs font-bold text-center py-4">
            Ad bar is turned off — nothing shows on the storefront.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Desktop layout */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-300 mb-1">Desktop</p>
              <div className="rounded-xl overflow-hidden border border-stone-200">
                <div className="bg-[#153d2b] text-white flex items-center justify-between gap-4 px-5 min-h-9 text-[11px] font-bold">
                  <span className="flex items-center gap-2 text-emerald-50">
                    <Zap size={13} fill="currentColor" className="text-lime-300" /> {form.text || "—"}
                  </span>
                  {form.subtext && (
                    <span className="flex items-center gap-2 text-emerald-100/70">
                      <MapPin size={13} /> {form.subtext}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile marquee (auto-scroll loop) */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-300 mb-1">Mobile — auto-scroll loop</p>
              <div className="rounded-xl overflow-hidden border border-stone-200 max-w-[380px]">
                <div className="bg-[#153d2b] text-white flex min-h-8 items-center overflow-hidden">
                  <div className="adbar-marquee flex w-max">
                    <Strip items={items} />
                    <Strip items={items} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor */}
      <form onSubmit={save} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 space-y-5 max-w-2xl">
        <label className="flex items-center justify-between gap-4">
          <span className="text-xs font-black text-stone-800">Show ad bar on storefront</span>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, enabled: !f.enabled }))}
            className={`relative h-6 w-11 rounded-full transition cursor-pointer ${form.enabled ? "bg-[#153d2b]" : "bg-stone-300"}`}
            aria-pressed={form.enabled}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.enabled ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </label>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Primary text (left)</label>
          <input
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            placeholder="Fresh groceries delivered in 10 minutes"
            className="w-full h-11 rounded-xl border-2 border-stone-200 focus:border-emerald-600 outline-none px-4 text-xs font-bold text-stone-800 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Secondary text (right)</label>
          <input
            value={form.subtext}
            onChange={(e) => setForm((f) => ({ ...f, subtext: e.target.value }))}
            placeholder="Delivering near you · 7am–11pm"
            className="w-full h-11 rounded-xl border-2 border-stone-200 focus:border-emerald-600 outline-none px-4 text-xs font-bold text-stone-800 transition"
          />
          <p className="text-[10px] font-medium text-stone-400">Leave blank to hide the right-hand message.</p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center gap-2 bg-[#153d2b] hover:bg-emerald-800 text-white rounded-xl px-5 py-3 text-xs font-black transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Ad Bar</>}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes adbarScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .adbar-marquee { animation: adbarScroll 14s linear infinite; }
      `}</style>
    </div>
  );
}
