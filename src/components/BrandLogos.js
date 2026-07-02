import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBasket,
  Zap,
  Truck,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Home", icon: LayoutDashboard, path: "/admin" },
  { label: "Products", icon: ShoppingBasket, path: "/admin/products" },
  { label: "Orders", icon: Zap, path: "/admin/orders" },
  { label: "Delivery", icon: Truck, path: "/admin/delivery" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 pb-safe lg:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive =
            path === "/admin"
              ? location.pathname === "/admin" || location.pathname === "/admin/"
              : location.pathname.startsWith(path);

          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
                isActive ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}