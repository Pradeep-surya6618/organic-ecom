import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider } from "./context/AuthContext";
import { OrderProvider } from './context/OrderContext';
import { AdminProvider } from "./context/AdminContext";
import { ProductProvider } from "./context/ProductContext";
import { ReviewProvider } from "./context/ReviewContext";
import { ContentProvider } from "./context/ContentContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/admin/AdminRoute";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget/ChatWidget"; // ← ADD THIS LINE

// Storefront pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import PageView from "./pages/PageView";
import BlogView from "./pages/BlogView";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import Recipes from "./pages/Recipes";
import Reviews from "./pages/Reviews";

// Admin pages
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminDelivery from "./pages/admin/AdminDelivery";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminContent from "./pages/admin/AdminContent";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSettings from "./pages/admin/AdminSettings";

import { useAuth } from "./context/AuthContext";

import BottomNavbar from "./components/BottomNavbar";
import ScrollToTop from "./components/ScrollToTop";

function Storefront() {
  return (
    <div className="min-h-screen flex flex-col bg-white pb-16 lg:pb-0">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<PageView slug="about" />} />
          <Route path="/page/:slug" element={<PageView />} />
          <Route path="/blog/:slug" element={<BlogView />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/account/:tab" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <BottomNavbar />
      <ChatWidget />
    </div>
  );
}

function AdminShell() {
  const { admin, adminLogout } = useAuth();
  return (
    <AdminLayout user={admin} logout={adminLogout}>
      <Routes>
        <Route index element={<AdminOverview user={admin} />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="delivery" element={<AdminDelivery />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="activity" element={<AdminActivity />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </AdminLayout>
  );
}

function App() {
  return (
    <ProductProvider>
      <ReviewProvider>
        <ContentProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <OrderProvider>
                  <AdminProvider>
                    <Toaster
                      position="top-center"
                      toastOptions={{
                        duration: 3500,
                        style: {
                          borderRadius: "14px",
                          background: "#ffffff",
                          color: "#1c1917",
                          fontSize: "13px",
                          fontWeight: 700,
                          padding: "10px 14px",
                          border: "1px solid #e7e5e4",
                          boxShadow: "0 12px 34px rgba(0,0,0,0.12)",
                        },
                        success: { iconTheme: { primary: "#153d2b", secondary: "#ffffff" } },
                        error: { duration: 4500, iconTheme: { primary: "#dc2626", secondary: "#ffffff" } },
                      }}
                    />
                    <ScrollToTop />
                    <Routes>
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route
                        path="/admin/*"
                        element={
                          <AdminRoute>
                            <AdminShell />
                          </AdminRoute>
                        }
                      />
                      <Route path="/*" element={<Storefront />} />
                    </Routes>
                  </AdminProvider>
                </OrderProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ContentProvider>
      </ReviewProvider>
    </ProductProvider>
  );
}

export default App;