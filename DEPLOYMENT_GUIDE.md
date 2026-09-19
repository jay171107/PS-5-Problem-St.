# EventFlow AI — Complete Cloud Hosting Guide 🌐🚀

This guide walks you through hosting **EventFlow AI** on the cloud for free with full real-time WebSocket and dynamic agenda support.

---

## 🎯 Hosting Architecture Overview

Since EventFlow AI uses **WebSockets (Socket.IO)** for instant teleprompter sync, the backend must be deployed on a platform that supports persistent WebSocket connections (such as **Render** or **Railway**).

You have two excellent hosting approaches:

| Method | Where It's Hosted | Complexity | Best For |
|---|---|---|---|
| **Option A (Recommended)** | **All-in-One on Render** | ⭐ Easiest (Single free service, 1 URL, zero CORS) | Fast deployment, hackathons, presentations |
| **Option B** | **Backend on Render + Frontend on Vercel** | ⭐⭐ Intermediate (Two services) | Production scalability with global CDN for frontend |

---

## 🚀 Pre-requisite: Push Code to GitHub

1. Open your terminal in the project directory:
   ```bash
   cd C:\Users\solan\.gemini\antigravity\scratch\eventflow-ai
   ```
2. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of EventFlow AI platform"
   ```
3. Create a new repository on [GitHub](https://github.com/new).
4. Link and push your repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

## 🌟 Option A: All-in-One Deployment on Render (100% Free & Easiest)

Your backend is already pre-configured to build the frontend and serve both the API and the React UI from a single service!

1. Sign up / log in to [Render.com](https://render.com).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository.
4. Configure the settings:
   - **Name**: `eventflow-ai`
   - **Environment**: `Node`
   - **Region**: Choose the closest region to you (e.g., Oregon or Frankfurt)
   - **Branch**: `main`
   - **Build Command**:
     ```bash
     npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Instance Type**: **Free**
5. **Environment Variables** (Under *Advanced*):
   - `PORT` = `5000`
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = *(Optional: your Gemini API key)*
   - `MONGODB_URI` = *(Optional: MongoDB Atlas connection string)*
6. Click **Deploy Web Service**.

🎉 Once deployed, Render will provide a URL like `https://eventflow-ai.onrender.com`.  
Both your frontend, backend API, and real-time Socket.IO will work seamlessly on this single URL!

---

## ⚡ Option B: Decoupled Deployment (Frontend on Vercel + Backend on Render)

If you prefer deploying the frontend separately on Vercel:

### Step 1: Deploy Backend on Render
1. In Render, create a **Web Service**.
2. **Root Directory**: `server`
3. **Build Command**: `npm install`
4. **Start Command**: `node src/server.js`
5. **Environment Variables**:
   - `PORT` = `5000`
   - `CLIENT_URL` = `https://your-frontend.vercel.app` (or `*`)
   - `GEMINI_API_KEY` = *(Optional)*
6. Note down your backend URL (e.g., `https://eventflow-backend.onrender.com`).

### Step 2: Deploy Frontend on Vercel
1. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. In **Root Directory**, click edit and select the `client` folder.
4. Framework Preset: **Vite**.
5. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://eventflow-backend.onrender.com` *(your Render backend URL)*
6. Click **Deploy**.

---

## 🍃 Optional: Free MongoDB Atlas Database Setup

By default, the backend uses a zero-setup persistent JSON storage file (`server/data/store.json`). If you want permanent cloud database storage:

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **Free Shared Cluster (M0)**.
3. Under **Database Access**, create a database user and password.
4. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
5. Click **Connect** $\rightarrow$ **Drivers (Node.js)** and copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/eventflow?retryWrites=true&w=majority
   ```
6. Add this string as `MONGODB_URI` in your Render Environment Variables.
