# 🌟 Lumio v2 — Real Backend Social Platform

Powered by **React + Vite + Supabase**. All data is real and persists.

---

## ✅ STEP 1 — Set Up Supabase Database

1. Go to your Supabase project → **SQL Editor** → **New Query**
2. Open the file `SCHEMA.sql` from this folder
3. Copy the entire contents and paste into the SQL editor
4. Click **Run** — you'll see "Success" 
5. Your database is ready!

---

## ✅ STEP 2 — Deploy to Vercel (Free)

1. Go to [github.com](https://github.com) → Create a new repo called `lumio`
2. Upload ALL files from this folder to the repo
3. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
4. Click **"Add New Project"** → Import your `lumio` repo
5. Click **Deploy** — Vercel auto-detects Vite
6. 🎉 Your site is live!

> Your Supabase URL and key are already baked in — no environment variables needed.

---

## 💻 Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔧 Features

| Feature | Status |
|---|---|
| Sign up / Log in | ✅ Real Supabase Auth |
| Create posts with images | ✅ Supabase Storage |
| Like & comment | ✅ Real database |
| Follow / unfollow users | ✅ Real database |
| Search users | ✅ Real database |
| Direct messages | ✅ Real database |
| Profile pages | ✅ Real database |
| Change password | ✅ Supabase Auth |
| Update profile / avatar | ✅ Real database + Storage |
| Delete account | ✅ Real database |

---

## 📁 File Structure

```
lumio/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── netlify.toml
├── SCHEMA.sql        ← Run this in Supabase first!
└── src/
    ├── main.jsx
    ├── App.jsx       ← Full app
    └── supabase.js   ← DB connection
```
