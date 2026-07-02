import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { Truck, MapPin, X, Navigation, CheckCircle2, Clock, Package, RefreshCw } from "lucide-react";
import { adminOrderAPI } from "../../services/api";

// Statuses that are relevant to the delivery desk.
const READY = ["confirmed", "processing", "packed"];
const ON_ROAD = ["out_for_delivery"];

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function AdminDelivery() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminOrderAPI.getAllOrders();
      const raw = res?.data?.orders || res?.orders || [];
      const relevant = raw
        .filter((o) => READY.includes(o.status) || ON_ROAD.includes(o.status))
        .map((o) => ({
          _id: o._id,
          orderNumber: o.orderNumber,
          status: o.status,
          customer: o.shippingAddress?.fullName || o.user?.fullName || "Customer",
          address: [o.shippingAddress?.address, o.shippingAddress?.city, o.shippingAddress?.pincode]
            .filter(Boolean).join(", ") || "No address on file",
          phone: o.shippingAddress?.phone || "",
          total: o.pricing?.total || 0,
          itemCount: o.items?.length || 0,
          eta: o.estimatedDelivery,
        }));
      setOrders(relevant);
    } catch (err) {
      console.error("Failed to fetch deliveries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Lock background scroll while the tracking modal is open.
  useEffect(() => {
    document.body.style.overflow = tracking ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [tracking]);

  const setStatus = async (order, backendStatus, label) => {
    const prev = orders;
    setOrders((list) => backendStatus === "delivered"
      ? list.filter((o) => o._id !== order._id)
      : list.map((o) => (o._id === order._id ? { ...o, status: backendStatus } : o)));
    try {
      await adminOrderAPI.updateOrderStatus(order._id, backendStatus);
      toast.success(`${order.orderNumber} → ${label}`);
    } catch (err) {
      console.error("Failed to update delivery status:", err);
      toast.error("Failed to update delivery status");
      setOrders(prev);
    }
  };

  const ready = orders.filter((o) => READY.includes(o.status));
  const onRoad = orders.filter((o) => ON_ROAD.includes(o.status));

  const Card = ({ order }) => {
    const onTheRoad = ON_ROAD.includes(order.status);
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black text-stone-900 truncate">{order.customer}</p>
            <p className="text-[10px] text-stone-400 font-bold uppercase mt-0.5">{order.orderNumber}</p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
            onTheRoad ? "bg-cyan-50 text-cyan-700" : "bg-amber-50 text-amber-700"
          }`}>
            {onTheRoad ? "on the way" : "to dispatch"}
          </span>
        </div>

        <div className="space-y-2 text-xs font-bold text-stone-600">
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-stone-400 shrink-0 mt-0.5" />
            <span className="min-w-0">{order.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package size={14} className="text-stone-400 shrink-0" />
            <span>{order.itemCount} item{order.itemCount !== 1 ? "s" : ""} · {inr(order.total)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
          {onTheRoad ? (
            <>
              <button
                onClick={() => setTracking(order)}
                className="flex-1 h-9 rounded-lg border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 text-[10px] font-black text-[#153d2b] transition cursor-pointer"
              >
                Track
              </button>
              <button
                onClick={() => setStatus(order, "delivered", "Delivered")}
                className="flex-1 h-9 rounded-lg bg-[#153d2b] hover:bg-emerald-800 text-white text-[10px] font-black transition cursor-pointer"
              >
                Mark Delivered
              </button>
            </>
          ) : (
            <button
              onClick={() => setStatus(order, "out_for_delivery", "Out for Delivery")}
              className="w-full h-9 rounded-lg bg-[#153d2b] hover:bg-emerald-800 text-white text-[10px] font-black transition cursor-pointer"
            >
              Dispatch for Delivery
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900">Delivery Dispatch</h2>
          <p className="text-xs font-medium text-stone-500 mt-1">Dispatch packed orders and track live deliveries.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-stone-200 text-[11px] font-black text-stone-600 hover:bg-stone-50 transition cursor-pointer shrink-0"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-center text-xs font-medium text-stone-400 py-12">Loading deliveries…</p>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-10 text-center">
          <Truck size={28} className="mx-auto text-stone-300" />
          <p className="text-sm font-black text-stone-700 mt-3">No active deliveries</p>
          <p className="text-xs font-medium text-stone-400 mt-1">Orders ready to ship will show up here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center"><Package size={15} /></span>
              <h3 className="text-sm font-black text-stone-900">Ready to Dispatch</h3>
              <span className="bg-stone-100 rounded-full px-2.5 py-0.5 text-[10px] font-black text-stone-600">{ready.length}</span>
            </div>
            {ready.length === 0 ? (
              <p className="text-stone-400 text-xs font-medium py-4">Nothing waiting to dispatch.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{ready.map((o) => <Card key={o._id} order={o} />)}</div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center"><Truck size={15} /></span>
              <h3 className="text-sm font-black text-stone-900">Out for Delivery</h3>
              <span className="bg-stone-100 rounded-full px-2.5 py-0.5 text-[10px] font-black text-stone-600">{onRoad.length}</span>
            </div>
            {onRoad.length === 0 ? (
              <p className="text-stone-400 text-xs font-medium py-4">No orders on the road right now.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{onRoad.map((o) => <Card key={o._id} order={o} />)}</div>
            )}
          </section>
        </div>
      )}

      {/* Live tracking modal — real order details */}
      {createPortal(tracking && (
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center overflow-y-auto bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200 px-4 py-6">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col my-auto animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-white relative z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 shrink-0">
                  <Navigation size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-stone-900 text-base">Live Tracking</h3>
                  <p className="text-xs font-bold text-stone-500 truncate">
                    {tracking.orderNumber} • {tracking.customer}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTracking(null)}
                className="h-9 w-9 rounded-xl bg-stone-50 flex items-center justify-center hover:bg-stone-100 text-stone-500 transition cursor-pointer border border-stone-200 shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="h-[380px] w-full relative bg-[#f1f3f4] overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "radial-gradient(#cbd5e1 2px, transparent 2px)",
                  backgroundSize: "30px 30px",
                }}
              />
              <svg className="absolute inset-0 w-full h-full" style={{ filter: "drop-shadow(0 4px 6px rgba(16, 185, 129, 0.2))" }}>
                <path d="M 150 300 Q 300 300 350 200 T 500 150" fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeDasharray="10 10" className="animate-pulse" />
              </svg>
              <div className="absolute top-[130px] left-[480px] flex flex-col items-center">
                <div className="bg-white px-2 py-1 rounded-lg shadow-sm border border-stone-200 mb-1">
                  <p className="text-[9px] font-black text-stone-600 uppercase">Dropoff</p>
                </div>
                <div className="text-rose-500 animate-bounce"><MapPin size={24} fill="currentColor" /></div>
              </div>
              <div className="absolute" style={{ top: "190px", left: "340px" }}>
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 bg-emerald-500/30 rounded-full animate-ping absolute" />
                  <div className="w-10 h-10 bg-[#153d2b] border-4 border-white rounded-full shadow-lg relative z-10 flex items-center justify-center">
                    <Truck size={14} className="text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-stone-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase text-stone-400 flex items-center gap-1"><MapPin size={10} /> Delivering to</p>
                    <p className="text-xs font-black text-stone-900 mt-0.5 truncate">{tracking.customer}</p>
                    <p className="text-[11px] font-bold text-stone-500 mt-0.5 line-clamp-2">{tracking.address}</p>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 border-t sm:border-t-0 sm:border-l border-stone-100 pt-3 sm:pt-0 sm:pl-6 shrink-0">
                    <div>
                      <p className="text-[10px] font-black uppercase text-stone-400 flex items-center gap-1"><Clock size={10} /> Est. Arrival</p>
                      <p className="text-sm font-black text-emerald-600">
                        {tracking.eta ? new Date(tracking.eta).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Soon"}
                      </p>
                    </div>
                    <button
                      onClick={() => { setStatus(tracking, "delivered", "Delivered"); setTracking(null); }}
                      className="h-10 px-4 rounded-xl bg-[#153d2b] hover:bg-emerald-800 text-white flex items-center justify-center gap-2 transition cursor-pointer shadow-md text-xs font-bold"
                    >
                      <CheckCircle2 size={14} /> Delivered
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ), document.body)}
    </div>
  );
}
