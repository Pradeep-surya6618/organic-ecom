import React, { useState } from "react";
import toast from "react-hot-toast";
import { Zap, Clock, Package, Check, ArrowRight, CheckCircle2, XCircle, Archive } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { adminOrderAPI } = await import('../../services/api');
      const response = await adminOrderAPI.getAllOrders();
      const rawOrders = response?.data?.orders || response?.orders || response?.data || [];
      
      const formattedOrders = rawOrders.map(order => {
        let status = 'incoming';
        if (order.status === 'processing') status = 'packing';
        if (order.status === 'out_for_delivery') status = 'delivering';
        if (order.status === 'delivered') status = 'completed';
        if (order.status === 'cancelled') status = 'cancelled';

        return {
          id: order.orderNumber,
          _id: order._id,
          customer: order.shippingAddress?.fullName || order.user?.fullName || "Customer",
          item: `${order.items.length} items`,
          total: `₹${order.pricing?.total?.toFixed(2)}`,
          time: new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          date: new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          paid: order.paymentStatus === 'completed',
          method: order.paymentMethod === 'online' ? 'Online' : 'COD',
          paymentId: order.payment?.razorpayPaymentId || null,
          rawStatus: order.status,
          status
        };
      });
      // Keep every order in state — the board shows active ones, the records
      // section below shows delivered/cancelled orders for history.
      setOrders(formattedOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, backendId, nextStatus) => {
    let backendStatus = 'confirmed';
    if (nextStatus === 'packing') backendStatus = 'processing';
    if (nextStatus === 'delivering') backendStatus = 'out_for_delivery';
    if (nextStatus === 'completed') backendStatus = 'delivered';

    try {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: nextStatus, rawStatus: backendStatus } : o)));

      const { adminOrderAPI } = await import('../../services/api');
      await adminOrderAPI.updateOrderStatus(backendId, backendStatus);
      const label = nextStatus === 'packing' ? 'Packing' : nextStatus === 'delivering' ? 'Out for Delivery' : 'Completed';
      toast.success(`Order ${id} → ${label}`);
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update order status');
      fetchOrders();
    }
  };

  const columns = [
    { title: "Incoming / New", key: "incoming", icon: Zap, tone: "amber" },
    { title: "Packing in Progress", key: "packing", icon: Package, tone: "blue" },
    { title: "Out for Delivery", key: "delivering", icon: Clock, tone: "green" },
  ];

  // Delivered + cancelled orders — kept for records.
  const pastOrders = orders.filter((o) => o.rawStatus === 'delivered' || o.rawStatus === 'cancelled');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-stone-900">Advance order</h2>
        <p className="text-xs font-medium text-stone-500 mt-1">Live 10-minute order management and dispatch queue.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {columns.map((col) => {
          const ColIcon = col.icon;
          const colOrders = orders.filter((o) => o.status === col.key);

          return (
            <div key={col.key} className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    col.tone === "amber" ? "bg-amber-50 text-amber-700" :
                    col.tone === "blue" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                  }`}>
                    <ColIcon size={16} />
                  </span>
                  <h3 className="text-sm font-black text-stone-900">{col.title}</h3>
                </div>
                <span className="bg-stone-100 rounded-full px-2.5 py-0.5 text-[10px] font-black text-stone-600">
                  {colOrders.length}
                </span>
              </div>

              <div className="space-y-3">
                {colOrders.length === 0 ? (
                  <p className="text-stone-400 text-xs font-medium text-center py-6">No orders in this phase.</p>
                ) : (
                  colOrders.map((order) => (
                    <div key={order.id} className="bg-stone-50 border border-stone-100 rounded-xl p-4 space-y-3 hover:border-emerald-200 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-stone-900">{order.id}</span>
                        <span className="text-xs font-black text-stone-950">{order.total}</span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-stone-800">{order.customer}</p>
                        <p className="text-[10px] text-stone-400 font-bold mt-0.5">{order.item}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          order.paid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {order.paid ? "Paid" : "Unpaid"} · {order.method}
                        </span>
                        {order.paymentId && (
                          <span className="text-[9px] font-bold text-stone-400 truncate max-w-[120px]" title={order.paymentId}>
                            {order.paymentId}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-stone-200/50">
                        <span className="text-[10px] font-bold text-stone-400">{order.time}</span>
                        {col.key === "incoming" && (
                          <button
                            onClick={() => updateStatus(order.id, order._id, "packing")}
                            className="inline-flex items-center gap-1 bg-[#153d2b] hover:bg-emerald-800 text-white rounded-lg px-2.5 py-1.5 text-[10px] font-black transition cursor-pointer"
                          >
                            <span>Accept</span> <ArrowRight size={10} />
                          </button>
                        )}
                        {col.key === "packing" && (
                          <button
                            onClick={() => updateStatus(order.id, order._id, "delivering")}
                            className="inline-flex items-center gap-1 bg-[#153d2b] hover:bg-emerald-800 text-white rounded-lg px-2.5 py-1.5 text-[10px] font-black transition cursor-pointer"
                          >
                            <span>Dispatch</span> <ArrowRight size={10} />
                          </button>
                        )}
                        {col.key === "delivering" && (
                          <button
                            onClick={() => updateStatus(order.id, order._id, "completed")}
                            className="inline-flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 text-[#153d2b] rounded-lg px-2.5 py-1.5 text-[10px] font-black transition cursor-pointer"
                          >
                            <Check size={10} /> <span>Complete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Past orders — records of delivered & cancelled orders */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
            <Archive size={16} />
          </span>
          <h3 className="text-sm font-black text-stone-900">Past Orders</h3>
          <span className="bg-stone-100 rounded-full px-2.5 py-0.5 text-[10px] font-black text-stone-600">
            {pastOrders.length}
          </span>
          <span className="text-[11px] font-medium text-stone-400">Delivered &amp; cancelled — kept for records</span>
        </div>

        {pastOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center">
            <p className="text-xs font-medium text-stone-400">No completed orders yet. Delivered orders will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
            {pastOrders.map((order) => {
              const delivered = order.rawStatus === 'delivered';
              return (
                <div key={order.id} className="p-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-stone-900">{order.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase inline-flex items-center gap-1 ${
                        delivered ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}>
                        {delivered ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {delivered ? "Delivered" : "Cancelled"}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-400 font-bold mt-1">{order.customer} · {order.item} · {order.date}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      order.paid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {order.paid ? "Paid" : "Unpaid"} · {order.method}
                    </span>
                    <span className="text-xs font-black text-stone-950">{order.total}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
