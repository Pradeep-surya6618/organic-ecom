# Deployment Guide — Organic Store

This app is **two apps** in one repo:

| Part | Folder | Deploy to |
|---|---|---|
| Frontend (React) | repo root (`src/`, `public/`) | **Vercel** |
| Backend (Express API) | `backend/` | **Render** |

> Vercel runs serverless functions and **cannot run the always-on Express server** (it also
> breaks the AI streaming + in-memory chat history). So the backend goes on **Render**, which
> runs a normal Node server. The two config files are already in the repo:
> - `render.yaml` → backend blueprint
> - `vercel.json` → frontend SPA routing

---

## 0. Before you deploy (one-time prep)

- [ ] **Push the repo to GitHub** (see the git steps you already ran).
- [ ] **Rotate your API keys** (Mongo password, Razorpay, OpenRouter, Gmail) — they were shown in screenshots earlier. Use the new values below.
- [ ] **MongoDB Atlas → Network Access → add `0.0.0.0/0`** (allow access from anywhere) so Render/Vercel can connect. Otherwise the DB connection will fail.
- [ ] Confirm `git status` shows **no `.env.local`** committed (it's gitignored ✅).

---

## Part A — Deploy the Backend to Render

**Option 1 — Blueprint (uses `render.yaml`, easiest):**
1. Go to <https://render.com> → sign up / log in with GitHub.
2. **New +** → **Blueprint** → select your repo → Render reads `render.yaml`.
3. It creates a web service named `organic-store-api`. When prompted, **fill in every `sync: false` value** (your real secrets):
   - `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - `OPENROUTER_API_KEY`
   - Email vars you use (`SMTP_HOST/PORT/SECURE/USER/PASS/FROM_EMAIL` and/or `EMAIL_USER/EMAIL_PASS`)
   - `CLIENT_URL` → leave blank for now (set it in Part C after Vercel).
4. Click **Apply** → wait for the build → you get a URL like
   **`https://organic-store-api.onrender.com`**.

**Option 2 — Manual (if you prefer clicking):**
1. **New +** → **Web Service** → connect repo.
2. Set: **Root Directory** = `backend`, **Build** = `npm install`, **Start** = `npm start`,
   **Health Check Path** = `/api/v1/health`, Plan = Free.
3. Add all the env vars listed above under **Environment**.

**Test it:** open `https://<your-render-url>/api/v1/health` → you should see
`{"success":true,"message":"Server running", ...}`.

---

## Part B — Deploy the Frontend to Vercel

1. Go to <https://vercel.com> → **Add New → Project** → import your repo.
2. Vercel auto-detects **Create React App** (Build `npm run build`, Output `build`). Leave defaults.
3. Under **Environment Variables**, add:
   | Name | Value |
   |---|---|
   | `REACT_APP_API_URL` | `https://<your-render-url>/api/v1` |
   | `REACT_APP_RAZORPAY_KEY_ID` | your Razorpay **key id** (public, `rzp_test_...`) |
4. **Deploy** → you get a URL like **`https://organic-store-xyz.vercel.app`**.

> `vercel.json` already rewrites all routes to `index.html`, so deep links like
> `/shop` or `/admin/orders` work on refresh.

---

## Part C — Connect the two

1. In **Render → your service → Environment**, set
   **`CLIENT_URL`** = your Vercel URL (`https://organic-store-xyz.vercel.app`) → **Save** (it redeploys).
2. CORS is already handled: the backend allows any `*.vercel.app` origin, so no code change is needed.

---

## Part D — Verify (smoke test the live site)

- [ ] Open the Vercel URL — storefront loads, products show (backend reachable).
- [ ] Register / log in as a customer.
- [ ] Add to cart → Checkout → pay with a **Razorpay test card** → invoice downloads.
- [ ] Log in to `/admin/login` → dashboard shows real numbers.
- [ ] Open the AI chat bubble → ask "do you have honey?" and the admin copilot "what needs my attention?".

---

## Notes & Gotchas

- **Render free tier sleeps** after ~15 min idle → the first request can take ~30–50s to wake. Normal for a student project.
- **AI streaming works on Render** (it's a real server), which is exactly why the backend isn't on Vercel.
- **MongoDB Atlas IP allowlist** is the #1 cause of "can't connect" — make sure `0.0.0.0/0` is added.
- **Razorpay**: test keys work end-to-end in test mode; switch to live keys only when going real.
- **Never commit `.env.local`** — set all secrets in the Render/Vercel dashboards instead.
- If email fails, orders still succeed — the invoice email is best-effort and won't block checkout.
