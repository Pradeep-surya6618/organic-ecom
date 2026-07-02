import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  Download,
  ShoppingBag,
  ChevronRight,
  Sparkles
} from "lucide-react";

const ACTIVITY_DOT = {
  order: "bg-emerald-500",
  delivery: "bg-cyan-500",
  review: "bg-amber-500",
  product: "bg-violet-500",
  catalog: "bg-violet-500",
  payment: "bg-emerald-500",
  system: "bg-stone-400",
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
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function AdminOverview({ user }) {
  const [activeDataNode, setActiveDataNode] = useState(null);
  const [dash, setDash] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { adminDashboardAPI, adminAnalyticsAPI, adminActivityAPI } = await import("../../services/api");
        const [s, chart, acts] = await Promise.all([
          adminDashboardAPI.getStats(),
          adminAnalyticsAPI.getSalesChart(7),
          adminActivityAPI.getAll({ limit: 5 }).catch(() => null),
        ]);
        setDash(s?.data || null);
        setSalesData(chart?.data || []);
        setActivities(acts?.data?.activities || []);
      } catch (e) {
        console.error("Dashboard load failed:", e?.message || e);
      } finally {
        setActivitiesLoaded(true);
      }
    })();
  }, []);

  const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  const stats = [
    { label: "Total Revenue", value: inr(dash?.totalRevenue), desc: "all time", icon: TrendingUp, tone: "emerald" },
    { label: "Active Customers", value: Number(dash?.totalUsers || 0).toLocaleString("en-IN"), desc: "registered", icon: Users, tone: "teal" },
    { label: "Total Products", value: `${dash?.totalProducts ?? 0}`, desc: "in catalog", icon: ShoppingBag, tone: "amber" },
    { label: "Orders Today", value: `${dash?.ordersToday ?? 0}`, desc: `${dash?.totalOrders ?? 0} all-time`, icon: Clock, tone: "rose" },
  ];

  // Build chart points from the real 7-day sales aggregation.
  const maxSales = Math.max(1, ...salesData.map((d) => d.sales || 0));
  const chartPoints = salesData.map((d, i) => {
    const x = salesData.length <= 1 ? 300 : 30 + i * (540 / (salesData.length - 1));
    const y = 170 - ((d.sales || 0) / maxSales) * 150;
    return { x, y, val: inr(d.sales), day: new Date(d._id).toLocaleDateString("en-US", { weekday: "short" }) };
  });
  const linePath = chartPoints.length ? "M " + chartPoints.map((p) => `${p.x} ${p.y}`).join(" L ") : "";
  const areaPath = chartPoints.length
    ? `M ${chartPoints[0].x} 170 L ` + chartPoints.map((p) => `${p.x} ${p.y}`).join(" L ") + ` L ${chartPoints[chartPoints.length - 1].x} 170 Z`
    : "";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-[#0b2216] via-[#103b22] to-[#1a5b3a] rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-xl shadow-emerald-950/10 border border-emerald-800/20">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-lime-400/20 rounded-full blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-black text-lime-300 uppercase tracking-widest border border-white/10">
              <Sparkles size={11} /> Live Dashboard
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none mt-1">
              Welcome back, {user?.fullName || "Admin"}!
            </h2>
            <p className="text-emerald-100/70 text-xs sm:text-sm font-medium">
              Here is a summary of what's happening at Organic Store today.
            </p>
          </div>
          <button
            onClick={() => alert("Generating live PDF report...")}
            className="self-start md:self-auto inline-flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-emerald-950 rounded-xl px-4 py-2.5 text-xs font-black transition-all shadow-lg shadow-lime-400/20 cursor-pointer"
          >
            <Download size={14} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 border border-stone-200/50 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow duration-200">
              <div className="space-y-1.5">
                <p className="text-stone-400 text-[10px] font-extrabold uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-stone-900 leading-none">{stat.value}</p>
                <div className="text-[10px] font-bold text-stone-500 flex items-center gap-1.5 pt-0.5">
                  <span className="text-stone-400 font-medium">{stat.desc}</span>
                </div>
              </div>
              <span className={`h-11 w-11 rounded-xl flex items-center justify-center shadow-inner ${
                stat.tone === "emerald" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                stat.tone === "teal" ? "bg-teal-50 text-teal-700 border border-teal-100" :
                stat.tone === "amber" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-red-50 text-red-700 border border-red-100"
              }`}>
                <Icon size={20} />
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Charts & Table section */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Sales & Traffic Trends Chart (SVG) */}
        <div className="bg-white rounded-3xl border border-stone-200/50 p-6 lg:col-span-2 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider">Weekly Revenue Analytics</h3>
              <p className="text-[11px] text-stone-400 font-bold mt-0.5">Interactive visual breakdown of revenue trends.</p>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-stone-700 bg-stone-50 border border-stone-200/60 rounded-lg px-2.5 py-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Revenue
              </span>
            </div>
          </div>

          {/* Premium Custom SVG Chart */}
          <div className="relative pt-4">
            <svg viewBox="0 0 600 200" className="w-full h-auto overflow-visible">
              {/* Background grids */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="70" x2="600" y2="70" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="170" x2="600" y2="170" stroke="#f4f4f5" strokeWidth="1" />

              {/* Area gradient under path */}
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {areaPath && <path d={areaPath} fill="url(#chartGrad)" />}

              {/* Curve Line (real data) */}
              {linePath && (
                <path d={linePath} fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              )}

              {/* Interactive nodes */}
              {chartPoints.map((pt, idx) => (
                <g key={idx} className="cursor-pointer group" onMouseEnter={() => setActiveDataNode(pt)} onMouseLeave={() => setActiveDataNode(null)}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    className="fill-white stroke-emerald-600 stroke-[3.5] transition-all group-hover:r-7"
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="10"
                    className="fill-emerald-500/25 opacity-0 group-hover:opacity-100 transition-all"
                  />
                  {/* Axis Label */}
                  <text x={pt.x} y="192" textAnchor="middle" className="text-[10px] fill-stone-400 font-extrabold uppercase">
                    {pt.day}
                  </text>
                </g>
              ))}
            </svg>

            {!chartPoints.length && (
              <p className="absolute inset-0 flex items-center justify-center text-xs font-bold text-stone-400">
                No sales data yet — revenue will appear here as orders come in.
              </p>
            )}

            {/* Hover tooltip widget */}
            {activeDataNode && (
              <div
                className="absolute bg-stone-900 text-white rounded-xl px-3 py-1.5 text-[10px] font-black pointer-events-none shadow-lg -translate-x-1/2 -translate-y-full flex flex-col items-center gap-0.5"
                style={{
                  left: `${(activeDataNode.x / 600) * 100}%`,
                  top: `${(activeDataNode.y / 200) * 100}%`,
                }}
              >
                <span>{activeDataNode.day}</span>
                <span className="text-emerald-400 text-xs">{activeDataNode.val}</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white rounded-3xl border border-stone-200/50 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider">Live Activity Log</h3>
              <p className="text-[11px] text-stone-400 font-bold mt-0.5">Real-time system operational feeds.</p>
            </div>
            
            <div className="space-y-4">
              {!activitiesLoaded ? (
                <p className="text-[11px] font-medium text-stone-400 py-4">Loading activity…</p>
              ) : activities.length === 0 ? (
                <p className="text-[11px] font-medium text-stone-400 py-4">No activity yet. Orders, dispatches and moderation will show up here.</p>
              ) : (
                activities.map((a, i) => (
                  <div key={a._id || i} className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ACTIVITY_DOT[a.type] || "bg-stone-400"} ${i === 0 ? "animate-ping" : ""}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-black text-stone-800 break-words">{a.action}</p>
                      <p className="text-[10px] font-medium text-stone-400">{a.actor || "System"} · {timeAgo(a.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link to="/admin/activity" className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 hover:text-emerald-950 transition-colors pt-4 border-t border-stone-100 mt-4">
            View full log <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div>
        <h3 className="text-sm font-extrabold text-stone-500 uppercase tracking-wider mb-4">Quick Workspaces</h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1: Product management */}
          <Link to="/admin/products" className="group bg-white rounded-2xl border border-stone-200/50 p-5 shadow-sm hover:shadow-md hover:border-emerald-600/30 transition-all flex flex-col justify-between min-h-[140px]">
            <div>
              <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center mb-4">
                <ShoppingBag size={18} />
              </div>
              <h4 className="text-sm font-black text-stone-800">Product management</h4>
              <p className="text-[11px] text-stone-500 font-medium mt-1 leading-normal">Control pricing, descriptions, and stock counts.</p>
            </div>
            <span className="text-[11px] font-black text-emerald-700 flex items-center gap-1 group-hover:gap-2 transition-all mt-4">
              Open inventory <ArrowRight size={13} />
            </span>
          </Link>

          {/* Card 2: Advance order */}
          <Link to="/admin/orders" className="group bg-white rounded-2xl border border-stone-200/50 p-5 shadow-sm hover:shadow-md hover:border-emerald-600/30 transition-all flex flex-col justify-between min-h-[140px]">
            <div>
              <div className="h-9 w-9 rounded-lg bg-teal-50 text-teal-800 border border-teal-100 flex items-center justify-center mb-4">
                <Clock size={18} />
              </div>
              <h4 className="text-sm font-black text-stone-800">Advance order</h4>
              <p className="text-[11px] text-stone-500 font-medium mt-1 leading-normal">Review the live queue and assign riders.</p>
            </div>
            <span className="text-[11px] font-black text-emerald-700 flex items-center gap-1 group-hover:gap-2 transition-all mt-4">
              Open live queue <ArrowRight size={13} />
            </span>
          </Link>

          {/* Card 3: Content manager */}
          <Link to="/admin/content" className="group bg-white rounded-2xl border border-stone-200/50 p-5 shadow-sm hover:shadow-md hover:border-emerald-600/30 transition-all flex flex-col justify-between min-h-[140px]">
            <div>
              <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-800 border border-amber-100 flex items-center justify-center mb-4">
                <Sparkles size={18} />
              </div>
              <h4 className="text-sm font-black text-stone-800">Content manager</h4>
              <p className="text-[11px] text-stone-500 font-medium mt-1 leading-normal">Update promotional banners and blog articles.</p>
            </div>
            <span className="text-[11px] font-black text-emerald-700 flex items-center gap-1 group-hover:gap-2 transition-all mt-4">
              Open editor <ArrowRight size={13} />
            </span>
          </Link>

          {/* Card 4: Store settings */}
          <Link to="/admin/settings" className="group bg-white rounded-2xl border border-stone-200/50 p-5 shadow-sm hover:shadow-md hover:border-emerald-600/30 transition-all flex flex-col justify-between min-h-[140px]">
            <div>
              <div className="h-9 w-9 rounded-lg bg-rose-50 text-rose-800 border border-rose-100 flex items-center justify-center mb-4">
                <TrendingUp size={18} />
              </div>
              <h4 className="text-sm font-black text-stone-800">Store settings</h4>
              <p className="text-[11px] text-stone-500 font-medium mt-1 leading-normal">Configure opening hours and delivery fees.</p>
            </div>
            <span className="text-[11px] font-black text-emerald-700 flex items-center gap-1 group-hover:gap-2 transition-all mt-4">
              Open settings <ArrowRight size={13} />
            </span>
          </Link>

        </div>
      </div>
    </div>
  );
}
