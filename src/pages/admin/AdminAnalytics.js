import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { IndianRupee, ShoppingBag, Users, Package, TrendingUp, Trophy } from "lucide-react";
import { adminDashboardAPI, adminAnalyticsAPI } from "../../services/api";

const STATUS_TONES = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-indigo-50 text-indigo-700",
  packed: "bg-violet-50 text-violet-700",
  out_for_delivery: "bg-cyan-50 text-cyan-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
};

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStats, setOrderStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [statsRes, chartRes, topRes, orderStatsRes] = await Promise.all([
          adminDashboardAPI.getStats().catch(() => null),
          adminAnalyticsAPI.getSalesChart(7).catch(() => null),
          adminAnalyticsAPI.getTopProducts(5).catch(() => null),
          adminAnalyticsAPI.getOrderStats().catch(() => null),
        ]);
        if (!alive) return;
        setStats(statsRes?.data || null);
        const rawChart = chartRes?.data || [];
        setChart(
          rawChart.map((d) => ({
            name: new Date(d._id).toLocaleDateString("en-IN", { weekday: "short" }),
            date: d._id,
            sales: d.sales,
            orders: d.orders,
          }))
        );
        setTopProducts(topRes?.data || []);
        setOrderStats(orderStatsRes?.data || []);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const kpis = [
    { label: "Total Revenue", value: inr(stats?.totalRevenue), icon: IndianRupee, tone: "emerald" },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingBag, tone: "blue" },
    { label: "Customers", value: stats?.totalUsers ?? 0, icon: Users, tone: "violet" },
    { label: "Active Products", value: stats?.totalProducts ?? 0, icon: Package, tone: "amber" },
  ];

  const totalOrdersForPct = orderStats.reduce((s, o) => s + o.count, 0) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-stone-900">Analytics Dashboard</h2>
        <p className="text-xs font-medium text-stone-500 mt-1">Live shop metrics from your store database.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                  k.tone === "emerald" ? "bg-emerald-50 text-emerald-700" :
                  k.tone === "blue" ? "bg-blue-50 text-blue-700" :
                  k.tone === "violet" ? "bg-violet-50 text-violet-700" : "bg-amber-50 text-amber-700"
                }`}>
                  <Icon size={17} />
                </span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-stone-900 mt-3">{loading ? "…" : k.value}</p>
              <p className="text-[10px] sm:text-xs font-bold text-stone-400 mt-0.5 uppercase tracking-wide">{k.label}</p>
            </div>
          );
        })}
      </div>

      {/* Today strip */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#153d2b] text-white rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wide text-emerald-200/80">Revenue Today</p>
          <p className="text-xl sm:text-2xl font-black mt-1">{loading ? "…" : inr(stats?.revenueToday)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wide text-stone-400">Orders Today</p>
          <p className="text-xl sm:text-2xl font-black text-stone-900 mt-1">{loading ? "…" : (stats?.ordersToday ?? 0)}</p>
        </div>
      </div>

      {/* Sales chart */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-[#153d2b]" />
          <h3 className="text-sm font-black text-stone-900">Sales — Last 7 Days (₹)</h3>
        </div>
        <div className="h-[300px] w-full text-xs">
          {chart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-stone-400 text-xs font-medium">
              {loading ? "Loading chart…" : "No sales in the last 7 days yet."}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="name" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip formatter={(value, key) => [key === "sales" ? inr(value) : value, key === "sales" ? "Sales" : "Orders"]} />
                <Line type="monotone" dataKey="sales" stroke="#153d2b" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top products */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-amber-500" />
            <h3 className="text-sm font-black text-stone-900">Top Selling Products</h3>
          </div>
          <div className="divide-y divide-stone-100">
            {topProducts.length === 0 ? (
              <p className="text-stone-400 text-xs font-medium py-6 text-center">{loading ? "Loading…" : "No sales recorded yet."}</p>
            ) : (
              topProducts.map((p, i) => (
                <div key={p._id || i} className="flex items-center gap-3 py-3">
                  <span className="h-7 w-7 rounded-lg bg-stone-100 text-stone-500 flex items-center justify-center text-xs font-black shrink-0">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-stone-800 truncate">{p.name || "Product"}</p>
                    <p className="text-[10px] font-bold text-stone-400">{p.totalSold} sold</p>
                  </div>
                  <span className="text-xs font-black text-emerald-700 shrink-0">{inr(p.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-stone-900">Orders by Status</h3>
          <div className="space-y-3">
            {orderStats.length === 0 ? (
              <p className="text-stone-400 text-xs font-medium py-6 text-center">{loading ? "Loading…" : "No orders yet."}</p>
            ) : (
              orderStats.map((s) => {
                const pct = Math.round((s.count / totalOrdersForPct) * 100);
                return (
                  <div key={s._id} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${STATUS_TONES[s._id] || "bg-stone-100 text-stone-600"}`}>
                        {String(s._id).replace(/_/g, " ")}
                      </span>
                      <span className="text-stone-500">{s.count} · {pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div className="h-full bg-[#153d2b] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
