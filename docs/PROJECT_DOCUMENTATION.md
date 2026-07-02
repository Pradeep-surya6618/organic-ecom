# Organic Store — AI-Powered Organic Grocery Platform
### Project Documentation

> 📎 **Companion guide:** For getting every API key and deploying the app step-by-step,
> see **[SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md)** in this same `docs/` folder.

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Objectives](#2-objectives)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Project Structure](#5-project-structure)
6. [Authentication & Sessions](#6-authentication--sessions)
7. [Customer (User) Side](#7-customer-user-side)
8. [Shopping, Payment & Invoice Flow](#8-shopping-payment--invoice-flow)
9. [Admin Side](#9-admin-side)
10. [AI Features — the highlight](#10-ai-features--the-highlight)
11. [How the AI Works (Under the Hood)](#11-how-the-ai-works-under-the-hood)
12. [Email System](#12-email-system)
13. [Database Models](#13-database-models)
14. [API Endpoint Reference](#14-api-endpoint-reference)
15. [Setup & Installation (local)](#15-setup--installation-local)
16. [Deployment (production)](#16-deployment-production)
17. [Security Measures](#17-security-measures)
18. [Future Enhancements](#18-future-enhancements)
19. [Conclusion](#19-conclusion)

---

## 1. Introduction

**Organic Store** is a full-stack, **AI-powered online grocery web application** that lets customers buy 100% organic products and lets store owners manage the entire business from an admin dashboard.

What makes this project unique is that **Artificial Intelligence is built into both sides of the store**:

- On the **customer side**, a smart shopping assistant can find products, add ingredients from a recipe to the cart, track orders, reorder, and answer any store question in natural language.
- On the **admin side**, an **AI "Store Copilot"** answers business questions ("how is revenue this week?"), performs operational actions with confirmation ("mark ORD… as delivered", "set stock of Honey to 50"), writes product descriptions, drafts replies to customers, and summarises reviews.

The application is built on the **MERN stack** (MongoDB, Express, React, Node.js) and integrates real online payments (Razorpay), automatic PDF invoices, transactional email (Brevo), and a Large Language Model (LLM) through OpenRouter.

**Live deployment:** the frontend runs on **Vercel** and the backend on **Render**, with the database on **MongoDB Atlas**.

---

## 2. Objectives

- Build a complete, real-world e-commerce platform (not a mock/demo).
- Provide separate, secure experiences for **customers** and **administrators**.
- Integrate a **real payment gateway** with signature verification and invoices.
- Demonstrate practical **AI integration** in a web app — search, recommendations, actions, and content generation grounded in the store's own live data.
- Make the whole store **backend-driven** and **admin-configurable** (products, categories, content, banners, contact details, the top ad-bar, etc.).
- **Deploy it to the cloud** so it is reachable on a public URL.

---

## 3. Technology Stack

### Frontend (customer + admin UI)
| Technology | Purpose |
|---|---|
| **React 18** (Create React App) | UI library / single-page application |
| **React Router** | Client-side routing (pages/URLs) |
| **Tailwind CSS** | Utility-first styling (admin + modern UI) |
| **styled-components** | Component-scoped CSS (storefront pages) |
| **Axios** | HTTP client for API calls |
| **Recharts** | Charts on analytics/dashboard |
| **lucide-react / react-icons** | Icon sets |
| **react-hot-toast** | Toast notifications |
| **framer-motion** | Animations |

### Backend (server + database)
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **MongoDB + Mongoose** | Database + object modeling |
| **JSON Web Tokens (JWT)** | Authentication (access + refresh tokens) |
| **bcrypt** | Password hashing |
| **Razorpay** | Online payment gateway |
| **pdfkit** | PDF invoice generation |
| **Brevo (HTTPS API) + nodemailer** | Transactional email — OTP codes & order invoices (Brevo in production, Gmail SMTP locally) |
| **multer** | File/image handling |
| **helmet, cors, express-rate-limit, express-mongo-sanitize, hpp, xss-clean** | Security hardening |

### AI Layer
| Technology | Purpose |
|---|---|
| **OpenRouter API** | Gateway to multiple LLMs (GPT-4o-mini, Claude 3.5 Haiku, Gemini 1.5 Flash, Llama 3.2) |
| **Native `fetch` + SSE** | Calls the LLM and streams responses token-by-token |

### Hosting
| Service | Hosts |
|---|---|
| **Vercel** | Frontend (React build) |
| **Render** | Backend (Node/Express server) |
| **MongoDB Atlas** | Cloud database |

---

## 4. System Architecture

The app follows a classic **three-tier architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React SPA — Vercel)               │
│  Customer storefront  +  Admin dashboard  +  AI chat widgets  │
└───────────────┬───────────────────────────────┬──────────────┘
                │  Axios (REST, JWT Bearer)      │  fetch (SSE stream)
                ▼                                ▼
┌─────────────────────────────────────────────────────────────┐
│            SERVER (Node.js + Express — Render)               │
│  Routes → Controllers → Services → Models                     │
│  Auth middleware · Role middleware · Security middleware      │
│  AI service (OpenRouter) · Invoice service · Email service    │
└───────────────┬───────────────────────────────┬──────────────┘
                │ Mongoose                       │ HTTPS
                ▼                                ▼
        ┌───────────────┐              ┌──────────────────┐
        │   MongoDB      │              │  External APIs   │
        │   (Atlas)      │              │  Razorpay        │
        └───────────────┘              │  OpenRouter (AI) │
                                       │  Brevo (email)   │
                                       └──────────────────┘
```

**Request flow example** (placing an order):
`React Checkout page → Razorpay payment → Express verifies signature → Order saved in MongoDB → PDF invoice generated → email sent via Brevo → success shown to user`.

---

## 5. Project Structure

```
organic-store-main/
├── docs/                       # This documentation
├── public/                     # index.html, favicon, static assets
├── src/                        # FRONTEND (React)
│   ├── components/             # Reusable UI (Header, Footer, HeroSlider,
│   │   ├── ChatWidget/         #   customer AI assistant
│   │   └── admin/              #   AdminLayout, AdminCopilot, AdBarEditor…
│   ├── pages/                  # Route pages
│   │   ├── Home, Shop, ProductDetail, Cart, Checkout, PaymentSuccess
│   │   ├── Account, Wishlist, Reviews, Recipes, Contact, About, PageView
│   │   └── admin/              # AdminOverview, AdminProducts, AdminOrders…
│   ├── context/                # React Context (global state)
│   │   └── AuthContext, CartContext, WishlistContext, ProductContext…
│   └── services/api.js         # All API calls (axios instances + helpers)
│
├── vercel.json                 # Vercel SPA routing config
├── render.yaml                 # Render backend blueprint
└── backend/                    # BACKEND (Node/Express)
    ├── server.js               # Starts server + loads env
    └── src/
        ├── app.js              # Express app + all route mounting
        ├── models/             # Mongoose schemas (19 collections)
        ├── controllers/        # Request handlers (incl. admin/ + ai)
        ├── routes/             # API route definitions
        ├── services/           # Business logic (order, invoice, ai, analytics…)
        ├── middleware/          # auth, role, error handling
        └── config/             # DB, mailer (Brevo/SMTP), AI config
```

**Why two axios instances?** The frontend `services/api.js` defines `api` (customer session) and `adminApi` (admin session) so the two logins never interfere with each other (see next section).

---

## 6. Authentication & Sessions

The app supports **two completely independent logins at the same time**:

| | Customer | Admin |
|---|---|---|
| Login page | `/login` | `/admin/login` |
| Stored token key | `organic_user` | `organic_admin` |
| Axios instance | `api` | `adminApi` |

**How it works:**
- On login, the server returns a **JWT access token** which the frontend stores in `localStorage`.
- Every API call sends the token in the `Authorization: Bearer <token>` header.
- The backend `auth.middleware` reads the **Bearer header first** (falling back to cookies), so a customer and an admin can be logged in in the same browser without logging each other out.
- **Role middleware** (`requireAdmin`) protects all admin endpoints — a normal customer token cannot access them.
- **OTP verification** is used during signup/login for extra security. The 6-digit OTP is generated, saved to the database, and emailed to the user.

Passwords are hashed with **bcrypt** and never stored in plain text.

---

## 7. Customer (User) Side

| Page | What it does |
|---|---|
| **Home** | Hero slider, promotional sections, featured products, blog stories |
| **Shop** | Product grid with search, **category filter (live from DB)**, price & rating filters; supports `?category=` links |
| **Product Detail** | Image gallery, price, rating, description, add to cart/wishlist |
| **Cart** | Edit quantities, see Subtotal + Shipping + Tax + Total |
| **Checkout** | Pick a **saved address** or add a new one, then pay online |
| **Payment Success** | Confirmation + **download PDF invoice** |
| **Account** | Profile edit, **order history + tracking**, **address book**, invoices |
| **Wishlist** | Saved products |
| **Reviews** | Customer testimonials (submit + view) |
| **Recipes / Blog / Pages** | Content managed by the admin (About, FAQ, Shipping, Returns, Privacy, Terms) |
| **Contact** | Sends an enquiry that appears in the admin's Messages page |

**Top ad-bar** (green strip above the navbar) and **footer contact details / social links** are all **editable by the admin** — nothing is hardcoded.

**Pricing formula** (used identically on the frontend and backend so the charged amount always matches the invoice):
```
shipping = subtotal > ₹500 ? FREE : ₹40
tax      = 5% of subtotal
total    = subtotal + shipping + tax
```

---

## 8. Shopping, Payment & Invoice Flow

This is the core e-commerce flow and uses a **real payment gateway (Razorpay in test mode)**:

1. **Cart** → customer proceeds to **Checkout**.
2. Customer selects a **saved delivery address** (or adds a new one, which is saved to their account and also shows in the dashboard).
3. Frontend asks the backend to **create a Razorpay order** (`/payment/create-order`).
4. The **Razorpay checkout popup** opens; the customer pays (UPI / card / net banking).
5. On success, Razorpay returns a payment signature. The backend **verifies the signature** using HMAC-SHA256 (`/payment/verify-payment`) — this proves the payment is genuine and not forged.
6. The **order is created** in MongoDB with the payment details stored (`razorpayOrderId`, `razorpayPaymentId`, amount, paidAt).
7. A **PDF invoice** is generated with **pdfkit** and **emailed** to the customer (via **Brevo** in production, or Gmail SMTP locally).
8. The customer is shown a success page and can **download the invoice**; the order appears in **Account → Orders** and in the **admin order board**.

Order lifecycle (status): `pending → confirmed → processing → packed → out_for_delivery → delivered` (or `cancelled`).

---

## 9. Admin Side

The admin dashboard (`/admin`) is a separate, protected area with its own layout, sidebar, and mobile bottom bar. All data is live from MongoDB.

| Section | What the admin can do |
|---|---|
| **Dashboard Overview** | KPIs (revenue, orders, customers, products), 7-day sales chart, **live activity feed** |
| **Product Management** | Create / edit / delete products, images (up to 3), stock, badges, **AI-generated descriptions** |
| **Categories** | Create / edit / delete categories; **can't delete a category that has products** (protected); used by product form, shop & footer |
| **Live Order Queue** | Kanban board (Incoming → Packing → Out for Delivery); update status; **Past Orders** records; shows payment info |
| **Delivery Dispatch** | Real orders grouped as "Ready to Dispatch" / "Out for Delivery"; mark delivered; live-tracking view |
| **Customer Reviews** | Approve / delete testimonials (with confirmation dialog) |
| **Customer Messages** | Read contact enquiries, mark read, delete, **AI "Draft reply"** |
| **Content Manager** | Edit the **top ad-bar** (with live preview), blogs, recipes, content pages, hero |
| **Analytics** | Revenue, top products, order-status breakdown, sales trends |
| **Activity Log** | Real audit trail of every important action (orders, products, reviews, AI actions…) |
| **Store Settings** | Contact info (phone/email/address) + social links shown on the storefront |

**Delete confirmation dialogs** are used everywhere (products, reviews, blogs, recipes, banners, categories, addresses) to prevent accidental deletion.

---

## 10. AI Features — the highlight

The project integrates AI in **two assistants**, both powered by the same AI engine but scoped differently.

### 10.1 Customer AI Assistant (storefront chat bubble)
A hybrid assistant — **instant rule-based actions + an AI brain** — that can:
- **Find products** ("do you have honey?") and show product cards.
- **Add / remove from cart & wishlist** by command ("add 2 apples to cart").
- **Recipe → cart**: "what can I cook with spinach?" shows matching recipes; one tap **adds all the recipe's ingredients** to the cart.
- **Track orders**: "track my order" / "track ORD202600001" shows live status.
- **Reorder**: "reorder" re-adds the last order's items to the cart.
- **Answer questions** about shipping, returns, privacy, delivery — grounded in the **real content pages** (so answers are never made up).
- **Streamed replies** (word-by-word, like ChatGPT) and **👍/👎 feedback** on answers.

### 10.2 Admin "Store Copilot" (admin chat bubble)
A business copilot that can:
- **Answer analytics questions** in plain English: "how's revenue this week?", "top selling products", "what needs my attention?" — using live store data.
- **Perform actions with a confirmation step** (never automatically):
  - "mark ORD… as delivered" · "set stock of Organic Honey to 50" · "hide Bananas" · "create category Herbs" · "hide all out-of-stock products".
  - Each action shows a **preview → Confirm/Cancel**, then executes and is **logged in the Activity Log**.
- **Generate product descriptions** (one-click "✨ Generate with AI" in the product form).
- **Draft replies** to customer messages.
- **Summarise review sentiment**: "any negative reviews I should address?"

---

## 11. How the AI Works (Under the Hood)

This section explains the AI implementation — useful for the project viva.

### The AI engine (`OpenRouterService`)
- The backend talks to **OpenRouter**, a service that gives access to many LLMs through one API.
- It uses a **model fallback chain**: it tries `gpt-4o-mini` first; if that fails it tries Claude, then Gemini, then a free Llama model. If all fail (or no API key), it falls back to a simple rule-based reply — so the chat **never crashes**.
- Requests are made with the native **`fetch`** API (no extra SDK dependency).

### Grounding (why the AI doesn't "hallucinate")
Before answering, the server builds a **context** from the real database and puts it into the AI's system prompt:
- **Customer AI** receives: the live product catalog (name, price, stock, category) + the store's content pages (FAQ/shipping/returns…) + the logged-in user's recent orders.
- **Admin Copilot** receives: KPIs, 7-day sales, top products, low/out-of-stock lists, orders by status, pending reviews, unread messages, and recent reviews.

Because the AI is told *"use ONLY this data, never invent prices,"* its answers reflect the **actual store**. This technique (feeding relevant real data into the prompt) is a lightweight form of **RAG — Retrieval-Augmented Generation**.

### Streaming (token-by-token)
The customer chat uses **Server-Sent Events (SSE)**: the server streams each word from the LLM to the browser as it's generated, so replies appear live instead of after a long pause.

### Actions (admin) — safe by design
The admin copilot uses a **deterministic command parser** (not the LLM) to detect operational commands. This is important: for anything that **changes data**, reliability matters more than "smart" parsing. The flow is:
```
Admin types command → parser finds the real order/product/category
   → returns a PREVIEW ("Change ORD… to delivered?")
   → admin clicks Confirm
   → /admin/ai/execute performs the change + writes to the Activity Log
```
So the AI can *act*, but a human always confirms, and every action is audited.

### Feedback loop
When a customer rates an AI answer 👎, it is stored in a `ChatFeedback` collection and a note is added to the **admin Activity Log**, so poor answers can be reviewed and improved (tuning).

---

## 12. Email System

The app sends two kinds of transactional email: **OTP codes** (signup/login) and **order invoices**.

**The challenge:** many cloud hosts — including **Render's free tier** — **block outbound SMTP** (ports 25/465/587) to prevent spam. So plain Gmail SMTP works locally but **times out in production**.

**The solution:** the mailer (`backend/src/config/nodemailer.js`) is written to use **two channels**:
- **Production → Brevo (HTTPS API):** if a `BREVO_API_KEY` is set, all email goes out through Brevo's `https://api.brevo.com` endpoint (port 443), which Render allows.
- **Local → Gmail SMTP (nodemailer):** if there is no Brevo key, it falls back to normal SMTP.

Additionally, OTP emails are sent **in the background (non-blocking)** — the API responds immediately and the email is dispatched afterwards, so login/signup never freeze even if email is slow.

---

## 13. Database Models

MongoDB collections (Mongoose schemas) used in the project:

| Model | Stores |
|---|---|
| **User** | Accounts (customer/admin), hashed password, role, OTP |
| **Product** | Products (name, price, stock, images, category ref, badges…) |
| **Category** | Product categories (name, slug) |
| **Order** | Orders (items, pricing, status, payment details, address) |
| **Address** | Customer saved delivery addresses |
| **Cart / Wishlist** | Server-side cart / wishlist (customer cart is also kept client-side) |
| **Review / Testimonial** | Product reviews & storefront testimonials |
| **Coupon** | Discount coupons |
| **Contact** | Contact-form enquiries |
| **Page** | Editable content pages (About, FAQ, Shipping, Returns, Privacy, Terms) |
| **Recipe** | Recipes with ingredients (used by AI recipe→cart) |
| **Blog** | Blog articles |
| **Banner / Hero** | Promotional content |
| **StoreSetting** | Contact info, social links, top ad-bar |
| **Delivery** | Delivery tracking records |
| **ActivityLog** | Audit trail of admin/system actions |
| **ChatFeedback** | 👍/👎 ratings on AI answers |

---

## 14. API Endpoint Reference

Base URL: `/api/v1`

| Group | Example endpoints |
|---|---|
| **Auth** | `POST /auth/register`, `/auth/login`, `/auth/verify-otp`, `/auth/verify-login-otp`, `/auth/me` |
| **Products** | `GET /products`, `GET /products/:id`, admin `POST/PUT/DELETE /products` |
| **Categories** | `GET /categories`, admin `GET /categories/admin/all`, `POST/PUT/DELETE` |
| **Orders** | `POST /orders`, `GET /orders`, `GET /orders/:id`, `GET /orders/:id/invoice`; admin `GET /orders/admin`, `PATCH /orders/admin/:id/status` |
| **Payment** | `POST /payment/create-order`, `POST /payment/verify-payment` |
| **Cart / Wishlist / Addresses** | `/cart`, `/wishlist`, `/addresses` (CRUD) |
| **Content** | `/pages`, `/recipes`, `/blogs`, `/banners`, `/hero`, `/testimonials` |
| **Contact & Settings** | `POST /contact`, admin `GET /contact`; `/site-settings`, `/site-settings/ad-bar` |
| **Admin dashboards** | `/admin/dashboard/stats`, `/admin/analytics/*`, `/admin/activity`, `/admin/delivery` |
| **Customer AI** | `POST /chat`, `POST /chat/stream`, `POST /chat/feedback` |
| **Admin AI** | `POST /admin/ai/chat`, `/admin/ai/execute`, `/admin/ai/product-description`, `/admin/ai/draft-reply` |

---

## 15. Setup & Installation (local)

### Prerequisites
- Node.js **v18+** (needed for the AI streaming `fetch`)
- A MongoDB Atlas connection string

### Backend
```bash
cd backend
npm install
# create backend/.env.local with the keys below
npm start        # starts the API server on http://localhost:5000
```

### Frontend
```bash
# from the project root
npm install
npm start        # starts React on http://localhost:3000
```

### Environment variables — backend (`backend/.env.local`)
| Key | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Token signing secrets |
| `JWT_EXPIRE`, `JWT_REFRESH_EXPIRE` | Token lifetimes (e.g. `15m`, `7d`) |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Payment gateway keys |
| `OPENROUTER_API_KEY` | AI model access |
| `SMTP_HOST/PORT/SECURE/USER/PASS/FROM_EMAIL/FROM_NAME` | Gmail SMTP (used **locally**) |
| `BREVO_API_KEY` | Brevo HTTPS email (used in **production**) |
| `CLIENT_URL` | Frontend URL (for links / CORS) |

### Environment variables — frontend (`.env` at project root)
| Key | Purpose |
|---|---|
| `REACT_APP_API_URL` | Backend base URL, **including `/api/v1`** |
| `REACT_APP_RAZORPAY_KEY_ID` | Razorpay public key id |

> ⚠️ **Never commit `.env` / `.env.local` files to GitHub** — they contain secret keys. They are already listed in `.gitignore`.

> 👉 Exactly **where to get each key** is explained step-by-step in **[SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md)**.

---

## 16. Deployment (production)

The app is deployed as **two separate services** from one GitHub repository:

| Part | Host | Notes |
|---|---|---|
| Frontend (React) | **Vercel** | Auto-builds the CRA app at the repo root |
| Backend (Express) | **Render** | Runs `node server.js` from the `/backend` folder |
| Database | **MongoDB Atlas** | Shared by local + production |

Two config files make this work:
- **`render.yaml`** — Render blueprint for the backend (root directory `backend`, health check `/api/v1/health`, env-var list).
- **`vercel.json`** — SPA routing so deep links (`/shop`, `/admin/...`) work on refresh.

**Full click-by-click deployment steps** (create the repo, push, deploy the Render backend, then the Vercel frontend, and connect them) are in **[SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md)**.

---

## 17. Security Measures

- **Password hashing** with bcrypt.
- **JWT authentication** with access + refresh tokens.
- **Role-based access control** — admin routes are blocked for normal users.
- **Razorpay signature verification** (HMAC-SHA256) so payments can't be faked.
- **Security middleware**: `helmet` (secure headers), `express-rate-limit` (anti-abuse), `express-mongo-sanitize` (NoSQL-injection protection), `xss-clean`, `hpp`, `cors`.
- **Secrets in environment variables** only — never hardcoded or committed to Git.
- **AI guardrails**: the AI answers only from provided store data; admin AI actions require confirmation and are behind admin auth; every action is logged.

---

## 18. Future Enhancements

- Streaming responses for the admin copilot.
- An admin "AI Feedback" screen to review 👎 answers.
- Push/live delivery tracking with real GPS.
- Bulk product import/export (CSV).
- Loyalty points & coupon automation.
- Multi-language AI assistant + voice output.

---

## 19. Conclusion

Organic Store demonstrates a **complete, production-style MERN e-commerce application** with **real payments, invoices, transactional email, and role-based admin management** — deployed to the cloud on Vercel + Render — and goes further by embedding **practical AI** into both the shopping experience and store operations. The AI is **grounded in the store's own live data**, can **take real actions safely (with confirmation and audit logging)**, and improves through **user feedback**. Together this shows both solid full-stack engineering and modern, applied AI integration.

---

*Prepared as project documentation for Organic Store — AI-Powered Organic Grocery Platform.*
