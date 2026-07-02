# 🌿 Organic Store - Complete MERN E-Commerce App

A high-fidelity, premium storefront and administrative panel built with React, Tailwind CSS, Express, Node.js, and MongoDB.

---

## 🔑 Admin Credentials

To access the administrative workspace, navigate to `/admin/login` and input the following pre-seeded credentials:

- **Work Email:** `admin@organicstore.com`
- **Secret Passkey:** `OrganicStore@2024`
- **One-Time Passcode (OTP):** The 6-digit code will be printed directly to the backend terminal console when you click "Authenticate". Copy and paste it to log in.

---

## 🛵 How to Run the App

Ensure you have a local MongoDB connection or configure your cluster URI inside `.env`.

### 1. Start the Backend Server
Navigate to the `backend` folder and start the API:
```bash
cd backend
npm install
npm run dev
```

### 2. Start the Frontend Application
Navigate to the root folder and start the React dev server:
```bash
npm install
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront in your browser.

---

## ✨ Features Added
- **Authentication Gate:** Complete registration, login, OTP code checks, and forgot-password resets matching the frontend and backend.
- **Admin Shell:** Interactive layout and navigation with tabs (Overview, Live Order Queue, Inventory, Delivery dispatch, Testimonials, Blogs, and Configurations).
- **Support Chat:** Interactive customer assistant floating bubble widget.
- **Responsive Layout:** Beautiful typography, curated green tone gradients, and micro-animations styled with modern Tailwind CSS.
