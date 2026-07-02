import React from "react";
import { NavLink } from "react-router-dom";
import { Home, ShoppingBag, ShoppingCart, Heart, UserRound } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

export default function BottomNavbar() {
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const { isLoggedIn } = useAuth();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-2 pb-safe">
      <div className="flex h-16 items-center justify-around bg-white">
        {/* Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-12 h-12 rounded-xl transition ${
              isActive ? "text-[#153d2b]" : "text-stone-400 hover:text-stone-600"
            }`
          }
        >
          <Home size={20} className="stroke-[2.5]" />
          <span className="text-[9px] font-black mt-1">Home</span>
        </NavLink>

        {/* Shop */}
        <NavLink
          to="/shop"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-12 h-12 rounded-xl transition ${
              isActive ? "text-[#153d2b]" : "text-stone-400 hover:text-stone-600"
            }`
          }
        >
          <ShoppingBag size={20} className="stroke-[2.5]" />
          <span className="text-[9px] font-black mt-1">Shop</span>
        </NavLink>

        {/* Cart */}
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition ${
              isActive ? "text-[#153d2b]" : "text-stone-400 hover:text-stone-600"
            }`
          }
        >
          <ShoppingCart size={20} className="stroke-[2.5]" />
          {totalItems > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-black text-amber-950 ring-2 ring-white">
              {totalItems}
            </span>
          )}
          <span className="text-[9px] font-black mt-1">Cart</span>
        </NavLink>

        {/* Wishlist */}
        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition ${
              isActive ? "text-[#153d2b]" : "text-[#9f9ea4] hover:text-stone-600"
            }`
          }
        >
          <Heart size={20} className="stroke-[2.5]" />
          {wishlistCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white">
              {wishlistCount}
            </span>
          )}
          <span className="text-[9px] font-black mt-1">Wishlist</span>
        </NavLink>

        {/* Account */}
        <NavLink
          to={isLoggedIn ? "/account" : "/login"}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-12 h-12 rounded-xl transition ${
              isActive ? "text-[#153d2b]" : "text-stone-400 hover:text-stone-600"
            }`
          }
        >
          <UserRound size={20} className="stroke-[2.5]" />
          <span className="text-[9px] font-black mt-1">Account</span>
        </NavLink>
      </div>
    </div>
  );
}
