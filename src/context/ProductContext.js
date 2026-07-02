import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productAPI, categoryAPI, adminProductAPI } from '../services/api';

const ProductContext = createContext();

// Map a backend Product document to the shape the storefront components expect.
const normalize = (p) => ({
  id: p._id,
  _id: p._id,
  name: p.name,
  description: p.description || '',
  price: p.price,
  originalPrice: p.comparePrice ?? null,
  category: p.category?.slug || 'all',
  categoryName: p.category?.name || '',
  categoryId: p.category?._id || p.category || null,
  rating: p.ratings?.average ?? 0,
  reviews: p.ratings?.count ?? 0,
  image: p.imageUrl || (Array.isArray(p.imageUrls) && p.imageUrls[0]) || '',
  images: Array.isArray(p.imageUrls) && p.imageUrls.length ? p.imageUrls : (p.imageUrl ? [p.imageUrl] : []),
  emoji: p.emoji || '📦',
  badge: p.badge || null,
  weight: p.weight || '',
  tags: p.tags || [],
  stock: p.stock ?? 0,
  inStock: (p.stock ?? 0) > 0,
  isHidden: p.isActive === false,
  sku: p.sku || '',
});

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);        // public / active products (storefront)
  const [adminProducts, setAdminProducts] = useState([]); // all products incl. hidden (admin panel)
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await productAPI.getProducts({ limit: 200 });
      const list = res?.data?.products || [];
      setProducts(list.map(normalize));
    } catch (e) {
      console.error('Failed to load products:', e.message || e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res?.data?.categories || res?.data || []);
    } catch (e) {
      console.error('Failed to load categories:', e.message || e);
    }
  }, []);

  // Admin-only: fetch every product (including hidden ones) via the admin token.
  const fetchAdminProducts = useCallback(async () => {
    try {
      const res = await adminProductAPI.getAll();
      const list = res?.data?.products || res?.data || [];
      setAdminProducts(list.map(normalize));
    } catch (e) {
      console.error('Failed to load admin products:', e.message || e);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const categoryIdForSlug = (slug) => {
    const c = categories.find((x) => x.slug === slug || x.name?.toLowerCase() === slug);
    return c?._id;
  };

  const refresh = useCallback(async () => {
    await Promise.all([fetchProducts(), fetchAdminProducts()]);
  }, [fetchProducts, fetchAdminProducts]);

  // ── Admin CRUD (persists to MongoDB via the admin token) ──
  const addProduct = async (form) => {
    const images = (form.images || (form.image ? [form.image] : [])).filter(Boolean);
    const mainImage = form.image || images[0];
    const payload = {
      name: form.name,
      description: form.description || `${form.name} — fresh & organic.`,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.categoryId || categoryIdForSlug(form.category) || categories[0]?._id,
      emoji: form.emoji || undefined,
      imageUrl: mainImage || undefined,
      imageUrls: images,
      badge: form.badge || undefined,
      unit: form.unit || 'piece',
      weight: form.weight || undefined,
    };
    await adminProductAPI.create(payload);
    await refresh();
  };

  const updateProduct = async (id, form) => {
    const payload = {};
    if (form.name != null) payload.name = form.name;
    if (form.description != null) payload.description = form.description;
    if (form.price != null) payload.price = Number(form.price);
    if (form.stock != null) payload.stock = Number(form.stock);
    if (form.emoji != null) payload.emoji = form.emoji;
    if (form.weight != null) payload.weight = form.weight;
    if (form.badge !== undefined) payload.badge = form.badge || '';
    if (form.images !== undefined) {
      const imgs = (form.images || []).filter(Boolean);
      payload.imageUrls = imgs;
      payload.imageUrl = form.image || imgs[0] || '';
    } else if (form.image !== undefined || form.imageUrl !== undefined) {
      payload.imageUrl = form.image || form.imageUrl || '';
    }
    if (form.category) payload.category = form.categoryId || categoryIdForSlug(form.category);
    await adminProductAPI.update(id, payload);
    await refresh();
  };

  const deleteProduct = async (id) => {
    await adminProductAPI.remove(id);
    await refresh();
  };

  const toggleProductVisibility = async (id) => {
    await adminProductAPI.toggleStatus(id);
    await refresh();
  };

  // Storefront only ever sees active products; the API already filters them.
  const visibleProducts = products;

  return (
    <ProductContext.Provider
      value={{
        products,
        visibleProducts,
        adminProducts,
        categories,
        loading,
        fetchCategories,
        fetchAdminProducts,
        refresh,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductVisibility,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
