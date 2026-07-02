import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    try {
      const savedUser = localStorage.getItem('organic_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      }
    } catch (err) {
      console.error('Error reading auth token for API request:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 unauthorized & attempt refresh token swap
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const { token } = refreshResponse.data.data;
        
        // Update user state in localStorage
        try {
          const savedUser = localStorage.getItem('organic_user');
          if (savedUser) {
            const parsed = JSON.parse(savedUser);
            parsed.token = token;
            localStorage.setItem('organic_user', JSON.stringify(parsed));
          }
        } catch (storageErr) {
          console.error('Error updating refresh token in localStorage:', storageErr);
        }
        
        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        const retriedResponse = await api(originalRequest);
        return retriedResponse;
      } catch (refreshErr) {
        // Refresh token failed or expired, clean up session
        try {
          localStorage.removeItem('organic_user');
        } catch { /* ignore */ }
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ── ADMIN API INSTANCE ────────────────────────────────────────────
// Separate instance that authenticates with the independent admin session
// (organic_admin), so admin calls never collide with the customer session.
const adminApi = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use(
  (config) => {
    try {
      const savedAdmin = localStorage.getItem('organic_admin');
      if (savedAdmin) {
        const parsed = JSON.parse(savedAdmin);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      }
    } catch (err) {
      console.error('Error reading admin auth token for API request:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminApi.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data || error)
);

// Admin-scoped order endpoints (use the admin session token).
export const adminOrderAPI = {
  getAllOrders: () => adminApi.get('/orders/admin'),
  updateOrderStatus: (id, status) => adminApi.patch(`/orders/admin/${id}/status`, { status }),
};

// Admin dashboard & analytics (admin session).
export const adminDashboardAPI = {
  getStats: () => adminApi.get('/admin/dashboard/stats'),
  getRecentOrders: () => adminApi.get('/admin/dashboard/recent-orders'),
  getRecentUsers: () => adminApi.get('/admin/dashboard/recent-users'),
};

export const adminAnalyticsAPI = {
  getSalesChart: (days = 7) => adminApi.get('/admin/analytics/sales-chart', { params: { days } }),
  getTopProducts: (limit = 10) => adminApi.get('/admin/analytics/top-products', { params: { limit } }),
  getOrderStats: () => adminApi.get('/admin/analytics/order-stats'),
};

// Admin activity / audit log (admin session).
export const adminActivityAPI = {
  getAll: (params) => adminApi.get('/admin/activity', { params }),
};

// Admin AI copilot (admin session).
export const adminAiAPI = {
  chat: (message) => adminApi.post('/admin/ai/chat', { message }),
  execute: (action) => adminApi.post('/admin/ai/execute', { action }),
  productDescription: (data) => adminApi.post('/admin/ai/product-description', data),
  draftReply: (data) => adminApi.post('/admin/ai/draft-reply', data),
};

// Admin-scoped product endpoints (create/update/delete require the admin token).
export const adminProductAPI = {
  getAll: () => adminApi.get('/products/admin', { params: { limit: 200 } }),
  create: (data) => adminApi.post('/products', data),
  update: (id, data) => adminApi.put(`/products/${id}`, data),
  remove: (id) => adminApi.delete(`/products/${id}`),
  toggleStatus: (id) => adminApi.patch(`/products/admin/${id}/toggle-status`),
};

// ── AUTH ENDPOINTS ────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  verifyLoginOTP: (data) => api.post('/auth/verify-login-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyResetOTP: (data) => api.post('/auth/verify-reset-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// ── PRODUCT ENDPOINTS ─────────────────────────────────────────────
export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (slugOrId) => api.get(`/products/${slugOrId}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// ── CATEGORY ENDPOINTS ────────────────────────────────────────────
export const categoryAPI = {
  getAll: () => api.get('/categories'),
};

// Admin category management (admin session).
export const adminCategoryAPI = {
  getAll: () => adminApi.get('/categories/admin/all'),
  create: (data) => adminApi.post('/categories', data),
  update: (id, data) => adminApi.put(`/categories/${id}`, data),
  remove: (id) => adminApi.delete(`/categories/${id}`),
};

// ── CONTACT ENDPOINT (public submit) ─────────────────────────────
export const contactAPI = {
  send: (data) => api.post('/contact', data),
};

// Admin — view & manage submitted contact messages (admin session).
export const adminContactAPI = {
  getAll: () => adminApi.get('/contact'),
  markRead: (id, isRead = true) => adminApi.patch(`/contact/${id}/read`, { isRead }),
  remove: (id) => adminApi.delete(`/contact/${id}`),
};

// ── SITE SETTINGS (contact details + social links) ────────────────
export const siteSettingsAPI = {
  get: () => api.get('/site-settings'),                 // public read
  getAdBar: () => api.get('/site-settings/ad-bar'),     // public read
};
export const adminSiteSettingsAPI = {
  get: () => adminApi.get('/site-settings'),
  update: (data) => adminApi.put('/site-settings', data),
  getAdBar: () => adminApi.get('/site-settings/ad-bar'),
  updateAdBar: (data) => adminApi.put('/site-settings/ad-bar', data),
};

// ── BANNERS ───────────────────────────────────────────────────────
export const bannerAPI = {
  getAll: () => api.get('/banners'),
};
export const adminBannerAPI = {
  getAll: () => adminApi.get('/banners/admin/all'),
  create: (data) => adminApi.post('/banners', data),
  update: (id, data) => adminApi.put(`/banners/${id}`, data),
  remove: (id) => adminApi.delete(`/banners/${id}`),
};

// ── HOME HERO ─────────────────────────────────────────────────────
export const heroAPI = {
  get: () => api.get('/hero'),
};
export const adminHeroAPI = {
  update: (data) => adminApi.put('/hero', data),
};

// ── BLOGS ─────────────────────────────────────────────────────────
export const blogAPI = {
  getAll: (params) => api.get('/blogs', { params }),
  getBySlug: (slug) => api.get(`/blogs/${slug}`),
};

export const adminBlogAPI = {
  getAll: () => adminApi.get('/blogs/admin'),
  create: (data) => adminApi.post('/blogs', data),
  update: (id, data) => adminApi.put(`/blogs/${id}`, data),
  remove: (id) => adminApi.delete(`/blogs/${id}`),
};

// ── RECIPES ───────────────────────────────────────────────────────
export const recipeAPI = {
  getAll: () => api.get('/recipes'),
};

export const adminRecipeAPI = {
  getAll: () => adminApi.get('/recipes/admin/all'),
  create: (data) => adminApi.post('/recipes', data),
  update: (id, data) => adminApi.put(`/recipes/${id}`, data),
  remove: (id) => adminApi.delete(`/recipes/${id}`),
};

// ── CONTENT PAGES (About, FAQ, Shipping, Returns, Privacy, Terms) ──
export const pageAPI = {
  getAll: () => api.get('/pages'),
  getBySlug: (slug) => api.get(`/pages/${slug}`),
};

export const adminPageAPI = {
  getAll: () => adminApi.get('/pages'),
  create: (data) => adminApi.post('/pages', data),
  update: (slug, data) => adminApi.put(`/pages/${slug}`, data),
  remove: (slug) => adminApi.delete(`/pages/${slug}`),
};

// ── TESTIMONIALS / general reviews ───────────────────────────────
export const testimonialAPI = {
  getAll: () => api.get('/testimonials'),          // approved + own (customer/guest)
  create: (data) => api.post('/testimonials', data),
  update: (id, data) => api.put(`/testimonials/${id}`, data),
  remove: (id) => api.delete(`/testimonials/${id}`),
};

export const adminTestimonialAPI = {
  getAll: () => adminApi.get('/testimonials/admin/all'),
  approve: (id) => adminApi.patch(`/testimonials/admin/${id}/approve`),
  remove: (id) => adminApi.delete(`/testimonials/admin/${id}`),
};

// ── ADDRESS ENDPOINTS (customer session) ─────────────────────────
export const addressAPI = {
  getAll: () => api.get('/addresses'),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  remove: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.patch(`/addresses/${id}/default`),
};

// ── CART ENDPOINTS ────────────────────────────────────────────────
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (productId, quantity) => api.post('/cart', { productId, quantity }),
  updateQuantity: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  removeItem: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete('/cart'),
};

// ── ORDER ENDPOINTS ───────────────────────────────────────────────
export const orderAPI = {
  placeOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  getAllOrders: () => api.get('/orders/admin'),
  updateOrderStatus: (id, status) => api.patch(`/orders/admin/${id}/status`, { status }),
};

// ── WISHLIST ENDPOINTS ────────────────────────────────────────────
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  addItem: (productId) => api.post('/wishlist', { productId }),
  removeItem: (productId) => api.delete(`/wishlist/${productId}`),
};

// ── REVIEW ENDPOINTS ──────────────────────────────────────────────
export const reviewAPI = {
  getReviews: (productId) => api.get(`/reviews/${productId}`),
  submitReview: (data) => api.post('/reviews', data),
  moderateReview: (id, status) => api.put(`/reviews/${id}/moderate`, { status }),
};

// ── USER ENDPOINTS ────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
};

// ── PAYMENT ENDPOINTS ─────────────────────────────────────────────
export const paymentAPI = {
  createOrder: (amount) => api.post('/payment/create-order', { amount }),
  verifyPayment: (data) => api.post('/payment/verify-payment', data),
};

// ── AI CHAT ASSISTANT ─────────────────────────────────────────────
export const chatAPI = {
  send: (message) => api.post('/chat', { message }),
  clear: () => api.post('/chat/clear'),
  feedback: (data) => api.post('/chat/feedback', data),
};

// Streaming chat over SSE (axios can't stream, so use fetch). Calls onToken(delta)
// as tokens arrive; resolves with { model, fallbackUsed, started }.
export async function streamChat(message, onToken) {
  let token = null;
  try {
    const saved = localStorage.getItem('organic_user');
    if (saved) token = JSON.parse(saved)?.token || null;
  } catch { /* ignore */ }

  const res = await fetch(`${baseURL}/chat/stream`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
  });
  if (!res.ok || !res.body) throw new Error(`Chat stream failed (${res.status})`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let meta = { started: false };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop();
    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith('data:')) continue;
      try {
        const obj = JSON.parse(line.slice(5).trim());
        if (obj.token) { meta.started = true; onToken(obj.token); }
        if (obj.done) meta = { ...meta, model: obj.model, fallbackUsed: obj.fallbackUsed };
      } catch { /* ignore partial */ }
    }
  }
  return meta;
}

export default api;
