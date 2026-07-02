# Setup & Deployment Guide — Organic Store
### For students / interns — a complete, step-by-step walkthrough

This guide takes you from an empty machine to a **live app on the internet**. It has three parts:

1. **Get all the API keys** (env variables) — which website, and step-by-step.
2. **Push the project to GitHub.**
3. **Deploy** — first the **backend on Render**, then the **frontend on Vercel**, then connect them.

> **How the app is hosted**
> | Part | Folder | Deployed to |
> |---|---|---|
> | Frontend (React) | repo root (`src/`, `public/`) | **Vercel** |
> | Backend (Express API) | `backend/` | **Render** |
> | Database | — | **MongoDB Atlas** |
>
> They are **two separate apps in one GitHub repo**. Render runs the always-on Node server; Vercel serves the React build. (Vercel can't run the Express server, which is why the backend goes on Render.)

---

# PART 1 — Get all the API keys (environment variables)

An **environment variable** is a secret/config value the app reads at runtime (database password, payment keys, etc.). We keep them **out of the code** and out of GitHub.

Here is every key the project needs, and exactly where to get it.

---

## 1.1 MongoDB Atlas → `MONGODB_URI`
**Website:** <https://www.mongodb.com/atlas>

1. Sign up / log in → **Create** a free cluster (**M0 Free** tier).
2. **Database Access** (left menu) → **Add New Database User** → set a username + password (save them). Give it "Read and write to any database".
3. **Network Access** (left menu) → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) → **Confirm**.
   *(This is required so Render/Vercel can connect. It's the #1 cause of "can't connect" errors.)*
4. **Database → Connect → Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```
5. Replace `<username>` and `<password>` with the DB user you made, and add your database name at the end:
   ```
   mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/organic_store
   ```
   → this is your **`MONGODB_URI`**.

---

## 1.2 JWT secrets → `JWT_SECRET`, `JWT_REFRESH_SECRET`
**No website** — you generate these yourself (they sign the login tokens).

Run this in a terminal **twice** (once for each) to get two long random strings:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
- First output → `JWT_SECRET`
- Second output → `JWT_REFRESH_SECRET`

Also set the token lifetimes (plain values, no website):
```
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

---

## 1.3 Razorpay (payments) → `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
**Website:** <https://dashboard.razorpay.com>

1. Sign up / log in.
2. Make sure you are in **Test Mode** (toggle at the top) for a project.
3. Go to **Account & Settings → API Keys** (or **Settings → API Keys**) → **Generate Test Key**.
4. Copy:
   - **Key Id** (starts with `rzp_test_...`) → `RAZORPAY_KEY_ID`
   - **Key Secret** → `RAZORPAY_KEY_SECRET`
5. The **Key Id** is also used by the frontend as `REACT_APP_RAZORPAY_KEY_ID`. The **secret** stays only on the backend.

> Test cards for demos: card `4111 1111 1111 1111`, any future expiry, any CVV.

---

## 1.4 OpenRouter (AI) → `OPENROUTER_API_KEY`
**Website:** <https://openrouter.ai/keys>

1. Sign up / log in (Google works).
2. Click **Create Key** → give it a name → **Create**.
3. Copy the key (starts with `sk-or-v1-...`) → `OPENROUTER_API_KEY`.

> OpenRouter has free/low-cost models. The app automatically falls back through several models, so a small balance is enough for a demo.

---

## 1.5 Brevo (email) → `BREVO_API_KEY` (+ verified sender)
**Website:** <https://www.brevo.com>

Email (OTP codes + invoices) is sent through **Brevo's HTTPS API** in production, because **Render's free tier blocks normal email (SMTP)**. Free plan = **300 emails/day**.

1. **Sign up** at Brevo (you can use your own Gmail).
2. **Verify a sender email** (so Brevo lets you send *from* it — no domain needed):
   - **Settings → Senders, Domains & Dedicated IPs → Senders → Add a Sender**.
   - Name: `Organic Store`, Email: *your email* (e.g. `you@gmail.com`).
   - Brevo emails you a confirmation link → click it → **verified** ✅.
3. **Create an API key:**
   - **SMTP & API → API Keys → Generate a new API key** → copy it (starts with `xkeysib-...`) → this is your **`BREVO_API_KEY`**.
4. Set the "from" details to your verified sender:
   ```
   SMTP_FROM_EMAIL=you@gmail.com     (the verified sender)
   SMTP_FROM_NAME=Organic Store
   ```

**For local development only** (optional — so email works on your PC), you can use Gmail SMTP with a Google **App Password** (<https://myaccount.google.com/apppasswords>):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@gmail.com
SMTP_PASS=your-16-char-app-password
```
> Locally (no Brevo key) the app uses SMTP. In production (with `BREVO_API_KEY`) it uses Brevo automatically.

---

## 1.6 URLs (filled in during deployment)
| Key | Where | Value |
|---|---|---|
| `CLIENT_URL` | backend (Render) | your Vercel frontend URL (set in Part 6) |
| `REACT_APP_API_URL` | frontend (Vercel) | your Render backend URL **+ `/api/v1`** (Part 5) |
| `REACT_APP_RAZORPAY_KEY_ID` | frontend (Vercel) | the Razorpay **Key Id** from 1.3 |

---

## 📋 Master list of all environment variables

**Backend** (Render / `backend/.env.local`):
| Key | From |
|---|---|
| `NODE_ENV` | set to `production` (Render) / `development` (local) |
| `MONGODB_URI` | MongoDB Atlas (1.1) |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | generated (1.2) |
| `JWT_EXPIRE`, `JWT_REFRESH_EXPIRE` | `15m`, `7d` (1.2) |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay (1.3) |
| `OPENROUTER_API_KEY` | OpenRouter (1.4) |
| `BREVO_API_KEY` | Brevo (1.5) — production email |
| `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME` | your verified sender (1.5) |
| `SMTP_HOST/PORT/SECURE/USER/PASS` | Gmail (1.5) — local email only |
| `CLIENT_URL` | Vercel URL (1.6) |

> ⚠️ **Do NOT set `PORT` on Render** — Render provides it automatically. Setting it can break the deploy.

**Frontend** (Vercel / root `.env`):
| Key | From |
|---|---|
| `REACT_APP_API_URL` | Render URL + `/api/v1` (1.6) |
| `REACT_APP_RAZORPAY_KEY_ID` | Razorpay Key Id (1.3) |

---

# PART 2 — Create the local env files (for running on your PC)

Create **`backend/.env.local`**:
```env
NODE_ENV=development
CLIENT_URL=http://localhost:3000

MONGODB_URI=mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/organic_store

JWT_SECRET=<paste generated secret 1>
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=<paste generated secret 2>
JWT_REFRESH_EXPIRE=7d

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx

# Email — local uses Gmail SMTP (add BREVO_API_KEY only if you want Brevo locally)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Organic Store
SMTP_FROM_EMAIL=you@gmail.com
```

Create **`.env`** in the project **root** (frontend):
```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

> These files are already in `.gitignore`, so they will **not** be pushed to GitHub. ✅

Run locally:
```bash
# terminal 1 (backend)
cd backend
npm install
npm start

# terminal 2 (frontend, from the repo root)
npm install
npm start
```

---

# PART 3 — Push the project to GitHub

1. Create an **empty** repository on <https://github.com> (don't add a README/gitignore, to avoid conflicts).
2. In the project root, run:
   ```bash
   git init
   git add .
   git status            # VERIFY: no .env / .env.local appears in the list
   git commit -m "Initial commit: Organic Store"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. ✅ Your `.gitignore` excludes `node_modules`, `.env`, `.env.local`, and `build/`, so **secrets are never uploaded**. Double-check `git status` before committing.

> To push later changes: `git add .` → `git commit -m "message"` → `git push`.

---

# PART 4 — Deploy the BACKEND to Render

**Website:** <https://render.com>  (sign in with GitHub)

The repo includes a **`render.yaml`** blueprint, so most settings are automatic.

1. **New +** → **Blueprint** → connect your repo → Render reads `render.yaml`.
2. Give the blueprint a name (e.g. `organic-store`). Branch: `main`. Blueprint path: leave blank.
3. Render creates a web service called **`organic-store-api`** and asks for the secret values — **paste each one** from Part 1:
   `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `OPENROUTER_API_KEY`, `BREVO_API_KEY`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`.
   - Leave `CLIENT_URL` blank for now (set in Part 6).
   - `NODE_ENV=production` is already set by the blueprint. **Do not add `PORT`.**
4. Click **Apply / Deploy**. Watch the **Logs**. When it says **"Your service is live 🎉"**, copy the URL at the top, e.g.:
   ```
   https://organic-store-api-xxxx.onrender.com
   ```
5. **Test it:** open `https://<your-render-url>/api/v1/health` — you should see
   `{"success":true,"message":"Server running", ...}` ✅

> **Alternative (manual)**: New + → Web Service → connect repo → **Root Directory = `backend`**, Build = `npm install`, Start = `npm start`, Health Check Path = `/api/v1/health`, Plan = Free → add the env vars.

---

# PART 5 — Deploy the FRONTEND to Vercel

**Website:** <https://vercel.com>  (sign in with GitHub)

1. **Add New → Project** → import your repo.
2. **Application Preset / Framework:** choose **Create React App**.
   - ⚠️ If Vercel shows a **"Services" / multi-service** view (because it detects the `backend/` folder), open the **Application Preset** dropdown and select **Create React App**. This makes Vercel build only the React app at the root and ignore `backend/`.
3. **Root Directory:** `./` (the repo root) — *not* `backend`.
4. Add **Environment Variables**:
   | Name | Value |
   |---|---|
   | `REACT_APP_API_URL` | `https://<your-render-url>/api/v1`  ← **must end with `/api/v1`** |
   | `REACT_APP_RAZORPAY_KEY_ID` | your `rzp_test_...` key id |
5. Click **Deploy**. After ~1–2 min you get a URL like `https://organic-ecom.vercel.app`.

> `vercel.json` already rewrites all routes to `index.html`, so `/shop`, `/admin/orders`, etc. work on refresh.

---

# PART 6 — Connect the two

1. **Render → `organic-store-api` → Environment** → set:
   ```
   CLIENT_URL = https://your-frontend.vercel.app
   ```
   → **Save** (Render redeploys). This is used for email links; CORS already allows any `*.vercel.app` origin.
2. Done — the frontend (Vercel) now talks to the backend (Render), which talks to MongoDB Atlas.

---

# PART 7 — Verify the live site

Open your Vercel URL and check:
- [ ] Products load on Home/Shop (first load may take ~50s — Render free tier "wakes up").
- [ ] **Register / Login** → OTP email arrives (via Brevo) → verify → logged in.
- [ ] Add to cart → **Checkout** → pay with a Razorpay test card → invoice downloads.
- [ ] `/admin/login` → dashboard shows real numbers.
- [ ] The **AI chat** bubble answers questions.

---

# PART 8 — Troubleshooting (real issues & fixes)

| Symptom | Cause | Fix |
|---|---|---|
| **"Route /auth/register not found"** | `REACT_APP_API_URL` is missing `/api/v1` | Set it to `https://<render>/api/v1`, then **Redeploy** the Vercel project |
| **Login/signup spinner never stops; logs show "email Connection timeout"** | Render free tier blocks SMTP | Add `BREVO_API_KEY` (Part 1.5) on Render + verify the sender email |
| **OTP email not arriving** | Brevo sender not verified, or key missing | Verify the sender in Brevo; confirm `BREVO_API_KEY` + `SMTP_FROM_EMAIL` on Render |
| **Products don't load; Network tab calls `localhost:5000`** | Frontend env var not set/baked | Set `REACT_APP_API_URL` in Vercel and **Redeploy** (CRA bakes env at build time) |
| **Backend logs: Mongo connection error** | Atlas IP not allowlisted, or wrong `MONGODB_URI` | Atlas → Network Access → add `0.0.0.0/0`; recheck the URI |
| **Vercel build fails ("Treating warnings as errors")** | Vercel sets `CI=true`; a lint warning blocks it | Fix the warning (remove unused variables), commit, push |
| **Vercel wants a multi-service `vercel.json`** | It detected the `backend/` Express app | Set **Application Preset = Create React App** on the import screen |
| **Render deploy fails: "No open ports detected"** | A manual `PORT` var was added | Remove `PORT` from Render — it's provided automatically |
| **First request very slow (~50s)** | Render free instance was asleep | Normal for the free tier; it wakes on the first request |

---

## Quick command reference
```bash
# Generate a JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Run backend locally
cd backend && npm install && npm start

# Run frontend locally (repo root)
npm install && npm start

# Test a live backend
#   open in browser:  https://<render-url>/api/v1/health

# Push changes to GitHub
git add . && git commit -m "message" && git push
```

---

*Setup & Deployment guide for Organic Store — AI-Powered Organic Grocery Platform.*
