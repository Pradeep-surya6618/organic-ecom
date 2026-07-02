const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

// CORS - specific origins, no wildcard
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175'
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Allow localhost or any vercel.app preview/production deployment
    if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Body parsing
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());

// Auth routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/v1/auth', authRoutes);

// Payment routes
const paymentRoutes = require('./routes/payment.routes');
app.use('/api/v1/payment', paymentRoutes);

// AI chat assistant
app.use('/api/v1/chat', require('./routes/chat.routes'));

// Admin Order Routes
const adminOrderRoutes = require('./routes/admin/order.routes');
app.use('/api/v1/orders/admin', adminOrderRoutes);

// Order routes
const orderRoutes = require('./routes/order.routes');
app.use('/api/v1/orders', orderRoutes);

// ── Products (admin sub-route mounted first so it isn't swallowed by /products) ──
app.use('/api/v1/products/admin', require('./routes/admin/product.routes'));
app.use('/api/v1/products', require('./routes/product.routes'));

// ── Categories ──
app.use('/api/v1/categories', require('./routes/category.routes'));

// ── Reviews (admin sub-route first) ──
app.use('/api/v1/reviews/admin', require('./routes/admin/review.routes'));
app.use('/api/v1/reviews', require('./routes/review.routes'));

// ── Blogs (admin sub-route first) ──
app.use('/api/v1/blogs/admin', require('./routes/admin/blog.routes'));
app.use('/api/v1/blogs', require('./routes/blog.routes'));

// ── Cart / Wishlist / Addresses ──
app.use('/api/v1/cart', require('./routes/cart.routes'));
app.use('/api/v1/wishlist', require('./routes/wishlist.routes'));
app.use('/api/v1/addresses', require('./routes/address.routes'));

// ── Users & Coupons ──
app.use('/api/v1/users', require('./routes/user.routes'));
app.use('/api/v1/coupons', require('./routes/coupon.routes'));

// ── Contact form ──
app.use('/api/v1/contact', require('./routes/contact.routes'));

// ── Site settings (contact details + social links; public read, admin write) ──
app.use('/api/v1/site-settings', require('./routes/siteSettings.routes'));

// ── Testimonials (general storefront reviews) ──
app.use('/api/v1/testimonials', require('./routes/testimonial.routes'));

// ── Editable content pages (About, FAQ, Shipping, Returns, Privacy, Terms) ──
app.use('/api/v1/pages', require('./routes/page.routes'));

// ── Recipes ──
app.use('/api/v1/recipes', require('./routes/recipe.routes'));

// ── Home hero ──
app.use('/api/v1/hero', require('./routes/hero.routes'));

// ── Promotional banners ──
app.use('/api/v1/banners', require('./routes/banner.routes'));

// ── Admin dashboard / analytics / settings / delivery ──
app.use('/api/v1/admin/dashboard', require('./routes/admin/dashboard.routes'));
app.use('/api/v1/admin/analytics', require('./routes/admin/analytics.routes'));
app.use('/api/v1/admin/settings', require('./routes/admin/settings.routes'));
app.use('/api/v1/admin/delivery', require('./routes/admin/delivery.routes'));
app.use('/api/v1/admin/activity', require('./routes/admin/activity.routes'));
app.use('/api/v1/admin/ai', require('./routes/admin/ai.routes'));

// Health check
app.get('/api/v1/health', (req, res) => {
    res.json({ success: true, message: 'Server running', time: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        method: req.method
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
});

module.exports = app;