# Deployment Guide: Fisheries Smart Asset Reliability & Maintenance Suite

This guide walks you through deploying:
1. **Backend** on **Render** (as a Web Service)
2. **Frontend** on **Vercel** (as a Single-Page Application)

---

## 🛠️ Prerequisites
- A **GitHub** account with your repo: `https://github.com/nanivishu2008/Fisheries-Reliability-Suite.git`
- A free **Render** account at [render.com](https://render.com)
- A free **Vercel** account at [vercel.com](https://vercel.com)
- Your **MongoDB Atlas** connection string

---

## 🚀 Step 1: Push Latest Changes to GitHub

Before deploying, ensure all latest commits are pushed to your GitHub repository:

```bash
git push origin main
```

---

## 🟢 Step 2: Deploy Backend to Render

Deploy the backend first so you have your live backend API URL for Vercel.

1. **Log in to Render:** Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** &rarr; select **Web Service**.
3. Select **Build and deploy from a Git repository** &rarr; click **Next**.
4. Connect your GitHub account and select your repository: `Fisheries-Reliability-Suite`.
5. Fill in the service configuration:
   * **Name:** `fisheries-backend` (or your chosen name)
   * **Region:** Choose the region closest to your MongoDB Atlas cluster (e.g., `Singapore` or `Frankfurt` or `Oregon`)
   * **Branch:** `main`
   * **Root Directory:** `backend` *(⚠️ Critical: type `backend`)*
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
   * **Instance Type:** `Free`
6. Scroll down to **Environment Variables** &rarr; click **Add Environment Variable** for each:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `CORS_ORIGIN` | `*` |
   | `MONGODB_URI` | `mongodb+srv://vishal:vishal@cluster0.cuhep1k.mongodb.net/fisheries-project?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `fisheries-reliability-jwt-secret-key-2026` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `GEMINI_API_KEY` | *(Optional: paste your Google Gemini API key if you want generative AI synthesis)* |
7. Under **Advanced**, set **Health Check Path** to `/api/v1/health`.
8. Click **Create Web Service**.
9. Wait 2-3 minutes for Render to build and deploy. Once live, copy your Render URL at the top:
   * Example: `https://fisheries-backend-xxxx.onrender.com`
   * Test it in your browser: `https://fisheries-backend-xxxx.onrender.com/api/v1/health` (should return `{"status": "healthy"}`).

---

## 🔺 Step 3: Deploy Frontend to Vercel

1. **Log in to Vercel:** Go to [vercel.com](https://vercel.com).
2. Click **Add New...** &rarr; select **Project**.
3. Import your GitHub repository: `Fisheries-Reliability-Suite`.
4. In the **Configure Project** screen:
   * **Project Name:** `fisheries-reliability-suite` (or your choice)
   * **Framework Preset:** `Vite` (automatically detected)
   * **Root Directory:** Click **Edit** &rarr; select `frontend` &rarr; click **Continue** *(⚠️ Critical: must be `frontend`)*
5. Expand **Environment Variables** and add:
   * **Key:** `VITE_API_URL`
   * **Value:** `https://your-backend-name.onrender.com/api/v1` *(⚠️ Use your exact Render URL from Step 2 with `/api/v1` at the end)*
6. Click **Deploy**.
7. Wait ~1 minute for Vercel to build. Click **Continue to Dashboard** &rarr; **Visit** to open your live URL (e.g. `https://fisheries-reliability-suite.vercel.app`).

---

## 🔄 Step 4: Seed Clean Database on Render (One-Time)

To ensure the 4 authorized users (`Vishal`, `Arjun`, `Raj`, `Ram`) exist in your production database:
1. In your Render Dashboard, click on your `fisheries-backend` service.
2. Go to the **Shell** tab on the left.
3. Run the following command:
   ```bash
   node src/seed/clearData.js
   ```
4. This ensures all 4 users are created and the application has a clean baseline ready for use!

---

## 🧪 Step 5: Verify the Production App

1. Open your live Vercel frontend URL.
2. You will see the **Orange-White** login screen.
3. Click any of the 4 quick-login buttons:
   * **Maintenance Admin (Vishal)** &rarr; `admin@fisheries.org`
   * **Operations Manager (Arjun)** &rarr; `manager@fisheries.org`
   * **Technician (Raj)** &rarr; `tech@fisheries.org`
   * **Vendor (Ram)** &rarr; `vendor@marineparts.com`
4. Click **Authorize Access** &rarr; you are live!
