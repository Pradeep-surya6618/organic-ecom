import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

function renderWithProviders(element, location = "/") {
  return renderToStaticMarkup(
    <StaticRouter location={location}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>{element}</WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </StaticRouter>
  );
}

test("renders the redesigned storefront", () => {
  const html = renderWithProviders(<Home />);
  expect(html).toContain("Better groceries.");
  expect(html).toContain("Fresh picks, moving fast.");
  expect(html).toContain("The Organic Standard");
});

test("renders the dedicated admin authentication screen", () => {
  const html = renderWithProviders(<AdminLogin />, "/admin/login");
  expect(html).toContain("Admin authentication");
  expect(html).toContain("Access admin dashboard");
  expect(html).not.toContain("Development login:");
});

test("renders the functional admin workspace", () => {
  const html = renderWithProviders(<AdminDashboard />, "/admin");
  expect(html).toContain("Product management");
  expect(html).toContain("Advance order");
  expect(html).toContain("Content manager");
  expect(html).toContain("Store settings");
  expect(html).toContain("Export");
});
