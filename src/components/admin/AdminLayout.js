import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBasket,
  Tags,
  Zap,
  Truck,
  MessageSquareText,
  BookOpen,
  LineChart,
  Activity,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from "lucide-react";
import AdminCopilot from "./AdminCopilot";

export default function AdminLayout({ children, user, logout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  React.useEffect(() => {
    const fetchCount = async () => {
      try {
        const { adminOrderAPI } = await import('../../services/api');
        const response = await adminOrderAPI.getAllOrders();
        const rawOrders = response?.data?.orders || response?.orders || response?.data || [];
        const active = rawOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
        setActiveOrdersCount(active);
      } catch (e) {}
    };
    fetchCount();
  }, []);

  React.useEffect(() => {
    const fetchReviewCount = async () => {
      try {
        const { adminTestimonialAPI } = await import('../../services/api');
        const res = await adminTestimonialAPI.getAll();
        const list = res?.data || [];
        setPendingReviewsCount(list.filter((r) => r.status === 'pending').length);
      } catch (e) {}
    };
    fetchReviewCount();
  }, []);

  React.useEffect(() => {
    const fetchMessagesCount = async () => {
      try {
        const { adminContactAPI } = await import('../../services/api');
        const res = await adminContactAPI.getAll();
        const list = res?.data || [];
        setUnreadMessagesCount(list.filter((m) => !m.isRead).length);
      } catch (e) {}
    };
    fetchMessagesCount();
  }, []);

  // Lock background scroll while the mobile sidebar drawer is open.
  React.useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const navigation = [
    { label: "Dashboard Overview", path: "/admin", icon: LayoutDashboard },
    { label: "Product Management", path: "/admin/products", icon: ShoppingBasket },
    { label: "Categories", path: "/admin/categories", icon: Tags },
    { label: "Live Order Queue", path: "/admin/orders", icon: Zap, badge: activeOrdersCount > 0 ? activeOrdersCount.toString() : null },
    { label: "Delivery Dispatch", path: "/admin/delivery", icon: Truck },
    { label: "Customer Reviews", path: "/admin/reviews", icon: MessageSquareText, badge: pendingReviewsCount > 0 ? pendingReviewsCount.toString() : null },
    { label: "Customer Messages", path: "/admin/messages", icon: Mail, badge: unreadMessagesCount > 0 ? unreadMessagesCount.toString() : null },
    { label: "Content Manager", path: "/admin/content", icon: BookOpen },
    { label: "Analytics Dashboard", path: "/admin/analytics", icon: LineChart },
    { label: "Activity Log", path: "/admin/activity", icon: Activity },
    { label: "Store Settings", path: "/admin/settings", icon: Settings },
  ];
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true); // Desktop collapse
  const [profileOpen, setProfileOpen] = useState(false); // Header profile dropdown
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New order received (ORD-9843)", time: "2m ago", unread: true },
    { id: 2, text: "Banana stock is running low (< 10 left)", time: "10m ago", unread: true },
    { id: 3, text: "Customer Rajesh Kumar verified email", time: "1h ago", unread: false }
  ]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();

  // Find active nav item label for header title/breadcrumb
  const activeNav = navigation.find(n => n.path === location.pathname) || { label: "Dashboard" };

  return (
    <div className="min-h-screen bg-[#f8faf7] font-sans text-stone-900 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-stone-950/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-stone-200/50 bg-gradient-to-b from-[#0b2216] via-[#0f301e] to-[#0b2216] text-white shadow-2xl transition-all duration-300 overflow-hidden
          ${sidebarOpen ? "translate-x-0 w-[280px]" : "-translate-x-full w-0"}
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:self-start
          ${desktopSidebarOpen ? "lg:w-[280px]" : "lg:w-20"}
        `}
      >
        {/* Sidebar Header */}
        <div className={`flex h-20 items-center border-b border-emerald-950/40 transition-all duration-300 ${
          desktopSidebarOpen ? "justify-between px-6" : "lg:justify-center lg:px-0 justify-between px-6"
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-900/30 shrink-0">
              <span className="text-xl">🌿</span>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-lime-300 animate-ping" />
            </div>
            {desktopSidebarOpen && (
              <div className="animate-in fade-in duration-200">
                <p className="text-sm font-black tracking-tight bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
                  Organic Store
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/80">Admin Center</p>
              </div>
            )}
          </div>
          <button
            aria-label="Close sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-emerald-200/70 hover:bg-white/10 hover:text-white lg:hidden transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto scrollbar-none transition-all duration-300">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center rounded-xl py-3 text-xs font-bold transition-all duration-200 ${
                  desktopSidebarOpen 
                    ? "justify-between px-4" 
                    : "lg:justify-center lg:px-0 justify-between px-4"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-800 to-emerald-900 text-white shadow-md shadow-emerald-950/50 border-l-4 border-lime-400"
                    : "text-emerald-100/60 hover:bg-emerald-900/30 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    className={`transition-colors duration-200 shrink-0 ${
                      isActive ? "text-lime-300" : "text-emerald-200/40 group-hover:text-emerald-300"
                    }`}
                  />
                  {desktopSidebarOpen && (
                    <span className="animate-in fade-in duration-200 whitespace-nowrap">{item.label}</span>
                  )}
                </div>
                {item.badge && (
                  desktopSidebarOpen ? (
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-black transition-all ${
                      isActive 
                        ? "bg-lime-400 text-emerald-950" 
                        : "bg-emerald-950/60 text-emerald-300 group-hover:bg-emerald-800 group-hover:text-white"
                    }`}>
                      {item.badge}
                    </span>
                  ) : (
                    <span className="absolute top-2 right-2 lg:block hidden h-2 w-2 rounded-full bg-lime-400 border border-emerald-950 shadow-sm" />
                  )
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-emerald-950/40 p-4 bg-emerald-950/20 text-center transition-all duration-300">
          <p className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-widest truncate">
            {desktopSidebarOpen ? "© 2026 Organic Store" : "©"}
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-gradient-to-b from-[#0b2216] via-[#0f301e] to-[#0b2216] border-b border-emerald-950/40 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-lg shadow-emerald-950/20">
          <div className="flex items-center gap-4">
            <button
              aria-label="Toggle navigation menu"
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  setDesktopSidebarOpen(!desktopSidebarOpen);
                } else {
                  setSidebarOpen(!sidebarOpen);
                }
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-emerald-100 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-200/50">
              <span>Admin</span>
              <span>/</span>
              <span className="text-white font-extrabold">{activeNav.label}</span>
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex relative items-center">
              <Search size={16} className="absolute left-3 text-emerald-200/50" />
              <input
                type="text"
                placeholder="Global search..."
                className="w-48 xl:w-60 h-9 rounded-xl border border-white/10 pl-9 pr-4 text-xs font-semibold text-white outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all placeholder:text-emerald-200/40 bg-white/5"
              />
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Bell size={18} className="text-emerald-100" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-lime-400 border border-[#0b2216] animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-2 w-[calc(100vw-32px)] sm:w-72 max-w-72 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-3 duration-150">
                    <div className="px-3 py-2 border-b border-stone-100 flex items-center justify-between">
                      <p className="text-xs font-black text-stone-850">Notifications</p>
                      {notifications.some(n => n.unread) && (
                        <button 
                          onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))} 
                          className="text-[10px] font-black text-emerald-700 hover:text-emerald-950 transition-colors cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1 divide-y divide-stone-50">
                      {notifications.length === 0 ? (
                        <div className="px-3 py-4 text-center text-stone-400 text-xs font-semibold">
                          No notifications
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`px-3 py-2.5 text-left transition-colors ${n.unread ? "bg-emerald-50/20" : "hover:bg-stone-50"}`}>
                            <p className={`text-xs ${n.unread ? "font-black text-stone-850" : "font-semibold text-stone-600"}`}>
                              {n.text}
                            </p>
                            <span className="text-[9px] text-stone-400 font-bold block mt-0.5">{n.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-8 w-px bg-white/10" />

            {/* Profile Dropdown widget */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-1.5 pr-3 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="h-7 w-7 rounded-lg bg-emerald-500 text-emerald-950 flex items-center justify-center font-black text-xs uppercase shadow-sm">
                  {user?.fullName?.slice(0, 2) || "AD"}
                </span>
                <div className="text-left">
                  <p className="text-[10px] font-black text-white leading-none">{user?.fullName || "Administrator"}</p>
                  <p className="text-[8px] font-bold text-emerald-200/60 mt-0.5 uppercase tracking-wider">
                    {user?.role || "superadmin"}
                  </p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-3 duration-150">
                    <div className="px-3 py-2 border-b border-stone-100">
                      <p className="text-xs font-black text-stone-800">{user?.fullName || "Administrator"}</p>
                      <p className="text-[9px] text-stone-400 font-bold truncate">{user?.email || "admin@organicstore.com"}</p>
                    </div>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-black text-red-600 hover:bg-red-50 transition-colors text-left mt-1 cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — 5 quick links (like the storefront) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {[
            { label: "Home", path: "/admin", icon: LayoutDashboard, end: true },
            { label: "Products", path: "/admin/products", icon: ShoppingBasket },
            { label: "Orders", path: "/admin/orders", icon: Zap },
            { label: "Reviews", path: "/admin/reviews", icon: MessageSquareText },
            { label: "Settings", path: "/admin/settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-14 h-12 rounded-xl transition ${
                    isActive ? "text-[#153d2b]" : "text-stone-400 hover:text-stone-600"
                  }`
                }
              >
                <Icon size={20} className="stroke-[2.5]" />
                <span className="text-[9px] font-black mt-1">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* AI Store Copilot — floating assistant */}
      <AdminCopilot />
    </div>
  );
}
