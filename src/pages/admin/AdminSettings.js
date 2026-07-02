import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, Phone, Mail, MapPin, Loader2, Facebook, Twitter, Instagram } from "lucide-react";
import { adminSiteSettingsAPI } from "../../services/api";

const Field = ({ label, icon: Icon, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">{label}</label>
    <div className="relative flex items-center rounded-2xl border-2 border-stone-200 bg-white focus-within:border-emerald-600 transition duration-200">
      <Icon size={16} className="absolute left-4 text-stone-400 shrink-0" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 bg-transparent pl-11 pr-4 text-xs font-bold text-stone-850 outline-none placeholder:text-stone-400"
      />
    </div>
  </div>
);

export default function AdminSettings() {
  const [form, setForm] = useState({
    phone: "",
    email: "",
    address: "",
    social: { facebook: "", twitter: "", instagram: "", pinterest: "" },
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    let alive = true;
    adminSiteSettingsAPI.get()
      .then((res) => {
        if (alive && res?.data) {
          setForm({
            phone: res.data.phone || "",
            email: res.data.email || "",
            address: res.data.address || "",
            social: { facebook: "", twitter: "", instagram: "", pinterest: "", ...(res.data.social || {}) },
          });
        }
      })
      .catch(() => {})
      .finally(() => { if (alive) setFetching(false); });
    return () => { alive = false; };
  }, []);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setSocial = (key, value) => setForm((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminSiteSettingsAPI.update(form);
      toast.success("Contact details saved");
    } catch (err) {
      toast.error(err?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-stone-900">Store Settings</h2>
        <p className="text-xs font-semibold text-stone-500">Manage the contact details &amp; social links shown on the storefront and footer.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Contact Information */}
        <div className="bg-white rounded-3xl border border-stone-200/60 p-6 sm:p-8 shadow-xl shadow-stone-900/5 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-sm font-black text-stone-900 mb-5">Contact Information</h3>
          <div className="space-y-5">
            <Field label="Phone" icon={Phone} value={form.phone} onChange={(v) => set("phone", v)} placeholder="9942585985" />
            <Field label="Email" icon={Mail} type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="organicstore@gmail.com" />
            <Field label="Address" icon={MapPin} value={form.address} onChange={(v) => set("address", v)} placeholder="123 Organic Street, Tech City, Hyderabad" />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-3xl border border-stone-200/60 p-6 sm:p-8 shadow-xl shadow-stone-900/5 relative overflow-hidden">
          <h3 className="text-sm font-black text-stone-900 mb-1">Social Links</h3>
          <p className="text-[11px] font-semibold text-stone-400 mb-5">Full URLs. Leave blank to hide (link falls back to #).</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Facebook" icon={Facebook} value={form.social.facebook} onChange={(v) => setSocial("facebook", v)} placeholder="https://facebook.com/…" />
            <Field label="Twitter / X" icon={Twitter} value={form.social.twitter} onChange={(v) => setSocial("twitter", v)} placeholder="https://twitter.com/…" />
            <Field label="Instagram" icon={Instagram} value={form.social.instagram} onChange={(v) => setSocial("instagram", v)} placeholder="https://instagram.com/…" />
            <Field label="Pinterest" icon={MapPin} value={form.social.pinterest} onChange={(v) => setSocial("pinterest", v)} placeholder="https://pinterest.com/…" />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || fetching}
            className="inline-flex items-center gap-2 bg-[#153d2b] hover:bg-emerald-800 text-white rounded-xl px-5 py-3 text-xs font-black transition-all shadow-lg shadow-emerald-900/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? (<><Loader2 size={15} className="animate-spin" /><span>Saving…</span></>) : (<><Save size={15} /><span>Save Settings</span></>)}
          </button>
        </div>
      </form>
    </div>
  );
}
