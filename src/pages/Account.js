import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  User, ShoppingBag, Heart, MapPin, Mail, Phone,
  Edit3, CheckCircle, Clock, Truck, Box, ArrowRight,
  Calendar, DollarSign, LogOut, Home, ChevronRight, ChevronLeft,
  Receipt, RotateCcw, Leaf, Save, X, Loader2,
  Package, Plus, Shield, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { addressAPI } from '../services/api';
import useConfirm from '../components/ConfirmDialog';

/* ─────────────────────────────────────────────
   Mock orders (fallback)
───────────────────────────────────────────── */
// eslint-disable-next-line no-unused-vars
const MOCK_ORDERS = [
  {
    id: 'ORD-2026-001', date: '2026-06-05', status: 'delivered', total: 24.97,
    items: [
      { id: 1, name: 'Organic Red Apples', qty: 2, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=80&h=80&fit=crop' },
      { id: 2, name: 'Fresh Bananas', qty: 1, image: 'https://images.unsplash.com/photo-1571771894821-ce9f6f7c1d77?w=80&h=80&fit=crop' },
    ]
  },
  {
    id: 'ORD-2026-002', date: '2026-06-12', status: 'shipped', total: 18.49,
    items: [
      { id: 3, name: 'Organic Almonds', qty: 1, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=80&h=80&fit=crop' },
    ]
  },
  {
    id: 'ORD-2026-003', date: '2026-06-18', status: 'processing', total: 32.95,
    items: [
      { id: 4, name: 'Fresh Spinach', qty: 2, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=80&h=80&fit=crop' },
      { id: 5, name: 'Organic Honey', qty: 1, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=80&h=80&fit=crop' },
    ]
  }
];

const statusConfig = {
  delivered: { icon: <CheckCircle size={13} />, label: 'Delivered', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  shipped:   { icon: <Truck size={13} />,       label: 'Shipped',   bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500' },
  processing:{ icon: <Clock size={13} />,       label: 'Processing',bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  pending:   { icon: <Box size={13} />,         label: 'Pending',   bg: 'bg-stone-100',   text: 'text-stone-600',   dot: 'bg-stone-400' },
};

/* ─────────────────────────────────────────────
   Tab config
───────────────────────────────────────────── */
const TABS = [
  { id: 'orders',  label: 'My Orders',  icon: ShoppingBag },
  { id: 'profile', label: 'Profile',    icon: User },
  { id: 'address', label: 'Addresses',  icon: MapPin },
  { id: 'wishlist',label: 'Wishlist',   icon: Heart },
];

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ─────────────────────────────────────────────
   Main Account Component
───────────────────────────────────────────── */
const EMPTY_ADDRESS = { fullName: '', phone: '', address: '', city: '', state: '', pincode: '', landmark: '', type: 'home' };

export default function Account() {
  const navigate = useNavigate();
  const { tab: tabParam } = useParams();
  const { user, logout, isLoggedIn, updateProfile } = useAuth();
  const { confirm, confirmDialog } = useConfirm();

  // Active tab is driven by the URL param (/account/:tab), defaulting to orders.
  const activeTab = TABS.some((t) => t.id === tabParam) ? tabParam : 'orders';
  const goToTab = (id) => navigate(`/account/${id}`);

  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [orders, setOrders] = useState([]);

  /* ── Profile edit state ── */
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  /* ── Address book state (backed by the /addresses API) ── */
  const [addresses, setAddresses] = useState([]);
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState(null);
  const [addrForm, setAddrForm] = useState(EMPTY_ADDRESS);

  useEffect(() => {
    if (user) {
      setEditName(user.name || user.fullName || '');
      setEditPhone(user.phone || '');
    }
  }, [user]);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await addressAPI.getAll();
      setAddresses(res?.data || []);
    } catch (e) {
      // not signed in / network — leave empty
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchAddresses();
  }, [isLoggedIn, fetchAddresses]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { orderAPI } = await import('../services/api');
        const response = await orderAPI.getMyOrders();
        const apiOrders = response?.data?.orders || response?.orders || response?.data || [];
        if (apiOrders.length > 0) {
           const mappedOrders = apiOrders.map(o => ({
             id: o.orderNumber,
             backendId: o._id,
             date: o.createdAt,
             status: o.status,
             total: o.pricing?.total || 0,
             items: o.items.map((i, idx) => ({ id: i.product || idx, name: i.name, qty: i.quantity, image: i.image }))
           }));
           setOrders(mappedOrders);
        } else {
           setOrders([]);
        }
      } catch(e) {
         setOrders([]);
      }
    };
    fetchOrders();
  }, []);

  const totalSpent    = orders.reduce((s, o) => s + o.total, 0);
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const displayName   = user?.name || user?.fullName || 'Customer';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleProfileSave = async () => {
    if (!editName.trim()) return toast.error('Name cannot be empty');
    if (editPhone && !/^[0-9]{10}$/.test(editPhone)) return toast.error('Enter a valid 10-digit phone number');

    setProfileLoading(true);
    try {
      // success/error toast shown by AuthContext.updateProfile
      await updateProfile({ name: editName.trim(), phone: editPhone.trim() });
      setEditMode(false);
    } catch {
      // error toast already shown by AuthContext
    } finally {
      setProfileLoading(false);
    }
  };

  /* ── Address handlers (backed by /addresses API) ── */
  const openAddAddress = () => {
    setEditingAddrId(null);
    setAddrForm({ ...EMPTY_ADDRESS, fullName: displayName, phone: user?.phone || '' });
    setShowAddrModal(true);
  };

  const openEditAddress = (a) => {
    setEditingAddrId(a._id);
    setAddrForm({
      fullName: a.fullName, phone: a.phone, address: a.address, city: a.city,
      state: a.state, pincode: a.pincode, landmark: a.landmark || '', type: a.type || 'home',
    });
    setShowAddrModal(true);
  };

  const handleAddrSave = async (e) => {
    e.preventDefault();
    const { fullName, phone, address, city, state, pincode } = addrForm;
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      return toast.error('Please fill all required address fields');
    }
    if (!/^[0-9]{10}$/.test(phone)) return toast.error('Enter a valid 10-digit phone number');
    if (!/^[0-9]{6}$/.test(pincode)) return toast.error('Enter a valid 6-digit pincode');

    try {
      if (editingAddrId) {
        await addressAPI.update(editingAddrId, addrForm);
        toast.success('Address updated');
      } else {
        await addressAPI.create(addrForm);
        toast.success('Address added');
      }
      setShowAddrModal(false);
      fetchAddresses();
    } catch (err) {
      toast.error(err?.message || 'Failed to save address');
    }
  };

  const handleDeleteAddr = async (id) => {
    if (!(await confirm({
      title: 'Delete address?',
      message: 'This saved delivery address will be permanently removed.',
      confirmLabel: 'Delete address',
    }))) return;
    try {
      await addressAPI.remove(id);
      toast.success('Address removed');
      fetchAddresses();
    } catch (err) {
      toast.error(err?.message || 'Failed to remove address');
    }
  };

  const handleSetDefaultAddr = async (id) => {
    try {
      await addressAPI.setDefault(id);
      toast.success('Default address updated');
      fetchAddresses();
    } catch (err) {
      toast.error(err?.message || 'Failed to update default');
    }
  };

  const addrInput = "w-full h-11 border border-stone-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-emerald-600";

  /* ── Not logged in ── */
  if (!isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-stone-50 to-emerald-50/30 px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <Leaf size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 mb-2">Sign in to continue</h2>
          <p className="text-stone-500 text-sm mb-6">Access your orders, addresses, and account settings by signing in.</p>
          <Link to="/login"
            className="inline-flex items-center gap-2 bg-[#153d2b] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20">
            Sign In Now <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     Main dashboard
  ───────────────────────────────────────────── */
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-stone-50 via-white to-emerald-50/20">
      {confirmDialog}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-stone-400 mb-6">
          <Link to="/" className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 transition-colors">
            <Home size={12} /> Home
          </Link>
          <ChevronRight size={10} />
          <span className="text-stone-600">My Account</span>
        </nav>

        {/* ── Header Card ── */}
        <div className="relative rounded-3xl overflow-hidden mb-6 shadow-xl shadow-emerald-900/10">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f2d1e] via-[#153d2b] to-[#1a5c39]" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-300/10 rounded-full blur-2xl" />
          </div>

          <div className="relative px-6 py-6 sm:px-8 sm:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-lg sm:text-xl">{getInitials(displayName)}</span>
              </div>
              <div>
                <p className="text-emerald-200 text-xs font-semibold mb-0.5">Welcome back</p>
                <h1 className="text-white font-black text-xl sm:text-2xl">{displayName}</h1>
                <p className="text-emerald-300 text-xs flex items-center gap-1.5 mt-1">
                  <Mail size={11} /> {user?.email}
                  {user?.isVerified && (
                    <span className="inline-flex items-center gap-1 bg-emerald-500/30 border border-emerald-400/30 rounded-full px-2 py-0.5 text-emerald-200 ml-1">
                      <Shield size={9} /> Verified
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white text-sm font-bold
                hover:bg-white/20 hover:border-white/40 transition-all active:scale-95 self-start sm:self-auto">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
        {/* ── Main Layout ── */}
        <div className="flex items-start gap-5">

          {/* ── Sidebar — desktop ── */}
          <aside className={`hidden lg:flex flex-col gap-4 sticky top-32 self-start transition-all duration-300 shrink-0 ${menuCollapsed ? 'w-16' : 'w-64'}`}>
            
            {/* Card 1: Greeting */}
            <div className="bg-white border border-stone-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-sm relative overflow-hidden transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-800 font-bold">
                {getInitials(displayName)}
              </div>
              {!menuCollapsed && (
                <div className="min-w-0 flex-1 animate-in fade-in duration-200">
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Hello,</p>
                  <h4 className="text-sm font-bold text-stone-800 truncate">{displayName}</h4>
                </div>
              )}
            </div>

            {/* Card 2: Sidebar Menu Card */}
            <div className="bg-white border border-stone-200/80 rounded-2xl py-3 shadow-sm relative transition-all duration-300 flex-1 flex flex-col justify-between">
              
              {/* Floating Toggle Button */}
              <button
                type="button"
                onClick={() => setMenuCollapsed(!menuCollapsed)}
                className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center cursor-pointer hover:bg-stone-50 text-stone-500 z-10 transition-transform hover:scale-105 active:scale-95"
                title={menuCollapsed ? "Expand Menu" : "Collapse Menu"}
              >
                {menuCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
              </button>

              <nav className="space-y-1 px-2">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => goToTab(tab.id)}
                      className={`group relative flex items-center rounded-xl py-2.5 text-xs font-bold transition-all duration-200 w-full ${
                        menuCollapsed ? 'justify-center px-0' : 'justify-between px-3'
                      } ${
                        isActive
                          ? "bg-emerald-50/70 text-emerald-800 border-l-4 border-emerald-600"
                          : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={16}
                          className={`transition-colors duration-200 shrink-0 ${
                            isActive ? "text-emerald-700" : "text-stone-400 group-hover:text-stone-600"
                          }`}
                        />
                        {!menuCollapsed && (
                          <span className="animate-in fade-in duration-200 whitespace-nowrap">{tab.label}</span>
                        )}
                      </div>
                      {!menuCollapsed && (
                        <ChevronRight size={12} className={`transition-transform duration-200 ${isActive ? 'text-emerald-700 translate-x-0.5' : 'text-stone-350'}`} />
                      )}
                    </button>
                  );
                })}

                <div className="border-t border-stone-100 my-2" />

                {/* Quick Link - Shop */}
                <Link
                  to="/shop"
                  className={`group flex items-center rounded-xl py-2.5 text-xs font-bold transition-all duration-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 ${
                    menuCollapsed ? 'justify-center px-0' : 'justify-between px-3'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag
                      size={16}
                      className="text-stone-400 group-hover:text-stone-600 shrink-0 transition-colors"
                    />
                    {!menuCollapsed && (
                      <span className="animate-in fade-in duration-200 whitespace-nowrap">Browse Shop</span>
                    )}
                  </div>
                  {!menuCollapsed && (
                    <ChevronRight size={12} className="text-stone-300 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </Link>

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`group flex items-center rounded-xl py-2.5 text-xs font-bold transition-all duration-200 text-red-650 hover:bg-red-50 hover:text-red-700 w-full ${
                    menuCollapsed ? 'justify-center px-0' : 'justify-between px-3'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LogOut
                      size={16}
                      className="text-red-400 group-hover:text-red-600 shrink-0 transition-colors"
                    />
                    {!menuCollapsed && (
                      <span className="animate-in fade-in duration-200 whitespace-nowrap">Sign Out</span>
                    )}
                  </div>
                  {!menuCollapsed && (
                    <ChevronRight size={12} className="text-red-300 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </button>
              </nav>

              {/* Sidebar Footer */}
              <div className="mt-4 pt-3 border-t border-stone-100 px-3 text-center">
                <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                  {menuCollapsed ? "©" : "© 2026 organic store"}
                </p>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">

            {/* ── Stats Grid (Inside right column for sticky layout) ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {[
                { icon: Receipt, label: 'Total Orders', value: orders.length, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
                { icon: CheckCircle, label: 'Delivered', value: deliveredCount, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
                { icon: DollarSign, label: 'Total Spent', value: `₹${totalSpent.toFixed(0)}`, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
                { icon: Heart, label: 'Wishlist', value: '0', iconBg: 'bg-pink-100', iconColor: 'text-pink-600' },
              ].map((stat, i) => (
                <div key={i}
                  className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-5 flex items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <stat.icon size={18} className={stat.iconColor} />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-black text-stone-900">{stat.value}</div>
                    <div className="text-xs text-stone-500 font-semibold">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile tab pills */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => goToTab(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all
                    ${activeTab === tab.id
                      ? 'bg-[#153d2b] text-white shadow-md shadow-emerald-900/20'
                      : 'bg-white border border-stone-200 text-stone-600 hover:border-emerald-300'}`}>
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── ORDERS TAB ── */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                  <h2 className="font-black text-stone-900 text-base flex items-center gap-2">
                    <ShoppingBag size={16} className="text-emerald-600" /> Recent Orders
                  </h2>
                  <Link to="/shop" className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors">
                    Shop More <ArrowRight size={11} />
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <EmptyState
                    icon={<Package size={28} />}
                    title="No orders yet"
                    text="Start shopping to see your orders here."
                    btnText="Browse Products"
                    btnHref="/shop"
                  />
                ) : (
                  <div>
                    {orders.map((order, idx) => {
                      const sc = statusConfig[order.status] || statusConfig.pending;
                      return (
                        <div key={order.id}
                          className={`px-5 py-5 ${idx < orders.length - 1 ? 'border-b border-stone-100' : ''}`}>

                          {/* Order header */}
                          <div className="flex items-start justify-between mb-3 gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Receipt size={12} className="text-stone-400" />
                                <span className="text-xs font-black text-stone-700">{order.id}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium">
                                <Calendar size={11} />
                                {formatDate(order.date)}
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${sc.bg} ${sc.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              {sc.label}
                            </span>
                          </div>

                          {/* Items */}
                          <div className="flex gap-2.5 overflow-x-auto pb-2 mb-3 scrollbar-hide">
                            {order.items.map(item => (
                              <div key={item.id} className="flex-shrink-0 flex items-center gap-2.5 bg-stone-50 border border-stone-100 rounded-xl px-3 py-2">
                                <img src={item.image} alt={item.name}
                                  className="w-9 h-9 rounded-lg object-cover border border-stone-200" />
                                <div>
                                  <div className="text-xs font-bold text-stone-700 whitespace-nowrap max-w-[120px] truncate">{item.name}</div>
                                  <div className="text-xs text-stone-400 font-medium">Qty: {item.qty}</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-dashed border-stone-200">
                            <div className="font-black text-stone-900 text-sm">
                              ₹{order.total.toFixed(2)}
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'}/orders/${order.id}/invoice`, '_blank')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-all cursor-pointer"
                              >
                                <Receipt size={11} /> Invoice
                              </button>
                              {order.status === 'delivered' && (
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm">
                                  <RotateCcw size={11} /> Reorder
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── PROFILE TAB ── */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                  <h2 className="font-black text-stone-900 text-base flex items-center gap-2">
                    <User size={16} className="text-emerald-600" /> Profile Settings
                  </h2>
                  {!editMode ? (
                    <button onClick={() => setEditMode(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-200">
                      <Edit3 size={12} /> Edit Profile
                    </button>
                  ) : (
                    <button onClick={() => { setEditMode(false); setEditName(user?.name || user?.fullName || ''); setEditPhone(user?.phone || ''); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-600 text-xs font-bold hover:bg-stone-200 transition-all">
                      <X size={12} /> Cancel
                    </button>
                  )}
                </div>

                <div className="p-5 sm:p-6">
                  {/* Avatar section */}
                  <div className="flex items-center gap-4 mb-7 pb-6 border-b border-stone-100">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <span className="text-white font-black text-xl">{getInitials(displayName)}</span>
                    </div>
                    <div>
                      <h3 className="font-black text-stone-900 text-lg">{displayName}</h3>
                      <p className="text-stone-500 text-sm">{user?.email}</p>
                      {user?.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold mt-1">
                          <Shield size={11} /> Verified Account
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-4">

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1.5">Full Name</label>
                      {editMode ? (
                        <div className="relative flex items-center rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 focus-within:ring-4 focus-within:ring-emerald-100 transition-all">
                          <User size={15} className="ml-4 text-stone-400 flex-shrink-0" />
                          <input id="profile-name"
                            value={editName} onChange={e => setEditName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full h-11 px-3 bg-transparent text-sm font-semibold text-stone-900 outline-none placeholder:text-stone-400" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 h-11 px-4 bg-stone-50 rounded-2xl border border-stone-200">
                          <User size={15} className="text-stone-400" />
                          <span className="text-sm font-semibold text-stone-800">{displayName}</span>
                        </div>
                      )}
                    </div>

                    {/* Email — always readonly */}
                    <div>
                      <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1.5">Email Address</label>
                      <div className="flex items-center gap-3 h-11 px-4 bg-stone-50 rounded-2xl border border-stone-200">
                        <Mail size={15} className="text-stone-400" />
                        <span className="text-sm font-semibold text-stone-600">{user?.email}</span>
                        <span className="ml-auto text-xs text-stone-400 bg-stone-200 rounded-full px-2 py-0.5 font-bold">Locked</span>
                      </div>
                      <p className="mt-1 text-xs text-stone-400 px-1">Email cannot be changed after registration.</p>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                      {editMode ? (
                        <div className="relative flex items-center rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 focus-within:ring-4 focus-within:ring-emerald-100 transition-all">
                          <Phone size={15} className="ml-4 text-stone-400 flex-shrink-0" />
                          <input id="profile-phone"
                            value={editPhone} onChange={e => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="10-digit phone number"
                            className="w-full h-11 px-3 bg-transparent text-sm font-semibold text-stone-900 outline-none placeholder:text-stone-400" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 h-11 px-4 bg-stone-50 rounded-2xl border border-stone-200">
                          <Phone size={15} className="text-stone-400" />
                          <span className="text-sm font-semibold text-stone-800">
                            {user?.phone || <span className="text-stone-400 font-normal italic">Not added yet</span>}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Role badge */}
                    <div>
                      <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1.5">Account Type</label>
                      <div className="flex items-center gap-3 h-11 px-4 bg-stone-50 rounded-2xl border border-stone-200">
                        <Shield size={15} className="text-stone-400" />
                        <span className="text-sm font-semibold text-stone-800 capitalize">{user?.role || 'Customer'}</span>
                      </div>
                    </div>

                    {/* Save button */}
                    {editMode && (
                      <button id="profile-save" onClick={handleProfileSave} disabled={profileLoading}
                        className="w-full h-12 mt-2 rounded-2xl bg-[#153d2b] text-white text-sm font-black flex items-center justify-center gap-2
                          hover:bg-emerald-800 active:scale-[0.98] transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-60">
                        {profileLoading
                          ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                          : <><Save size={15} /> Save Changes</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── ADDRESSES TAB ── */}
            {activeTab === 'address' && (
              <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                  <h2 className="font-black text-stone-900 text-base flex items-center gap-2">
                    <MapPin size={16} className="text-emerald-600" /> Saved Addresses
                  </h2>
                  <button onClick={openAddAddress}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm">
                    <Plus size={12} /> Add New
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <EmptyState
                    icon={<MapPin size={28} />}
                    title="No saved addresses"
                    text="Add a delivery address to speed up your checkout experience."
                    btnText="Add Address"
                    onBtnClick={openAddAddress}
                  />
                ) : (
                  <div className="p-5 grid gap-4 sm:grid-cols-2">
                    {addresses.map((a) => (
                      <div key={a._id} className="relative rounded-2xl border border-stone-200 p-4 bg-stone-50/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 capitalize">{a.type}</span>
                          {a.isDefault && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-700">Default</span>
                          )}
                        </div>
                        <p className="text-sm font-black text-stone-900">{a.fullName}</p>
                        <p className="text-xs text-stone-500 font-semibold mt-0.5">{a.phone}</p>
                        <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                          {a.address}, {a.city}, {a.state} - {a.pincode}{a.landmark ? ` (${a.landmark})` : ''}
                        </p>
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-stone-200">
                          {!a.isDefault && (
                            <button onClick={() => handleSetDefaultAddr(a._id)}
                              className="text-[10px] font-black text-emerald-700 hover:text-emerald-900">Set default</button>
                          )}
                          <button onClick={() => openEditAddress(a)}
                            className="ml-auto inline-flex items-center gap-1 text-[10px] font-black text-stone-500 hover:text-stone-800">
                            <Edit3 size={11} /> Edit
                          </button>
                          <button onClick={() => handleDeleteAddr(a._id)}
                            className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 hover:text-red-700">
                            <Trash2 size={11} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── WISHLIST TAB ── */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100">
                  <h2 className="font-black text-stone-900 text-base flex items-center gap-2">
                    <Heart size={16} className="text-pink-500" /> My Wishlist
                  </h2>
                </div>
                <EmptyState
                  icon={<Heart size={28} />}
                  title="Your wishlist is empty"
                  text="Save products you love to your wishlist and find them here."
                  btnText="Explore Shop"
                  btnHref="/shop"
                />
              </div>
            )}

          </div>{/* end main content */}
        </div>{/* end flex layout */}

      </div>

      {/* ── ADD / EDIT ADDRESS MODAL ── */}
      {showAddrModal && (
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-stone-950/50 backdrop-blur-sm px-4 py-6 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-black text-stone-900">{editingAddrId ? 'Edit Address' : 'Add New Address'}</h3>
              <button onClick={() => setShowAddrModal(false)} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddrSave} className="space-y-3">
              <input placeholder="Full name" value={addrForm.fullName}
                onChange={(e) => setAddrForm((f) => ({ ...f, fullName: e.target.value }))} className={addrInput} />
              <input placeholder="Phone (10 digits)" value={addrForm.phone} inputMode="numeric"
                onChange={(e) => setAddrForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} className={addrInput} />
              <input placeholder="Address (house no, street, area)" value={addrForm.address}
                onChange={(e) => setAddrForm((f) => ({ ...f, address: e.target.value }))} className={addrInput} />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="City" value={addrForm.city}
                  onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))} className={addrInput} />
                <input placeholder="State" value={addrForm.state}
                  onChange={(e) => setAddrForm((f) => ({ ...f, state: e.target.value }))} className={addrInput} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Pincode (6 digits)" value={addrForm.pincode} inputMode="numeric"
                  onChange={(e) => setAddrForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} className={addrInput} />
                <select value={addrForm.type}
                  onChange={(e) => setAddrForm((f) => ({ ...f, type: e.target.value }))} className={`${addrInput} bg-white`}>
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <input placeholder="Landmark (optional)" value={addrForm.landmark}
                onChange={(e) => setAddrForm((f) => ({ ...f, landmark: e.target.value }))} className={addrInput} />

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowAddrModal(false)}
                  className="flex-1 h-11 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-extrabold text-stone-600 transition">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#153d2b] hover:bg-emerald-800 text-white text-xs font-extrabold transition shadow-lg">
                  {editingAddrId ? 'Save Changes' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* hide mobile scrollbar in tailwind */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Empty State component
───────────────────────────────────────────── */
function EmptyState({ icon, title, text, btnText, btnHref, onBtnClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4 text-stone-400">
        {icon}
      </div>
      <h3 className="font-black text-stone-800 text-base mb-1">{title}</h3>
      <p className="text-stone-500 text-sm mb-5">{text}</p>
      {btnText && btnHref && (
        <Link to={btnHref}
          className="inline-flex items-center gap-2 bg-[#153d2b] text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-emerald-800 transition-all shadow-md shadow-emerald-900/15">
          {btnText} <ArrowRight size={12} />
        </Link>
      )}
      {btnText && onBtnClick && (
        <button onClick={onBtnClick}
          className="inline-flex items-center gap-2 bg-[#153d2b] text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-emerald-800 transition-all shadow-md shadow-emerald-900/15">
          <Plus size={12} /> {btnText}
        </button>
      )}
    </div>
  );
}
