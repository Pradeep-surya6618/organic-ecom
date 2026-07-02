import React, { useState, useEffect } from "react";
import { Activity, User, ShoppingBag, Star, Package, Truck, CreditCard, RefreshCw } from "lucide-react";
import { adminActivityAPI } from "../../services/api";

const TYPE_META = {
  order: { icon: ShoppingBag, tone: "bg-blue-50 text-blue-700" },
  review: { icon: Star, tone: "bg-amber-50 text-amber-700" },
  product: { icon: Package, tone: "bg-violet-50 text-violet-700" },
  catalog: { icon: Package, tone: "bg-violet-50 text-violet-700" },
  delivery: { icon: Truck, tone: "bg-cyan-50 text-cyan-700" },
  payment: { icon: CreditCard, tone: "bg-emerald-50 text-emerald-700" },
  system: { icon: Activity, tone: "bg-stone-100 text-stone-500" },
};

function timeAgo(dateStr) {
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.floor((Date.now() - then) / 1000);
  if (secs < 60) return "Just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function AdminActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminActivityAPI.getAll({ limit: 50 });
      setLogs(res?.data?.activities || []);
    } catch (err) {
      console.error("Failed to fetch activity log:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900">Activity Log</h2>
          <p className="text-xs font-medium text-stone-500 mt-1">Live audit trail of store operations.</p>
        </div>
        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-stone-200 text-[11px] font-black text-stone-600 hover:bg-stone-50 transition cursor-pointer shrink-0"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
        {loading ? (
          <p className="p-8 text-center text-xs font-medium text-stone-400">Loading activity…</p>
        ) : logs.length === 0 ? (
          <p className="p-8 text-center text-xs font-medium text-stone-400">No activity recorded yet. Actions like orders, dispatches and moderation will appear here.</p>
        ) : (
          logs.map((log, i) => {
            const meta = TYPE_META[log.type] || TYPE_META.system;
            const Icon = meta.icon;
            return (
              <div key={log._id || i} className="p-4 flex items-start gap-4 hover:bg-stone-50/45 transition">
                <span className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${meta.tone}`}>
                  <Icon size={16} />
                </span>
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-black text-stone-850 break-words">{log.action}</p>
                  <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold flex-wrap">
                    <span className="flex items-center gap-1">
                      <User size={10} />
                      <span>{log.actor || "System"}</span>
                    </span>
                    {log.role && log.role !== "system" && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{log.role}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{timeAgo(log.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
