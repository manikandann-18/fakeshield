# FakeShield Deployment Guide

This guide explains how to deploy all tiers of the FakeShield platform (MongoDB Atlas, Python AI service, Node.js backend API, and React frontend) to the cloud for free.

---

## 1. Database Deployment (MongoDB Atlas)
Since you need your users, posts, and verification logs to persist permanently, use MongoDB Atlas.
1. Sign up/Log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a new project, then click **Create Database** and select the **M0 (Free)** shared cluster.
3. In **Database Access**, create a user (e.g. `fakeshield_admin`) and set a strong password.
4. In **Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere** (`0.0.0.0/0`) so your hosted backend can connect.
5. Click **Connect** -> **Drivers** (Node.js) and copy the connection string:
   `mongodb+srv://fakeshield_admin:<password>@cluster0.xxxx.mongodb.net/fakeshield?retryWrites=true&w=majority`

---

## 2. Python AI Service Deployment (FastAPI on Render)
Deploy the Python machine learning microservice using [Render](https://render.com) (free tier).
1. Push your code to GitHub.
2. Sign up on Render and link your GitHub account.
3. Click **New +** -> **Web Service**.
4. Select your `fakeshield` repository.
5. Configure the service settings:
   * **Name**: `fakeshield-ai`
   * **Root Directory**: `python_service`
   * **Language**: `Python`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Click **Deploy Web Service**.
7. Copy the generated URL (e.g., `https://fakeshield-ai.onrender.com`).

---

## 3. Node.js Backend Deployment (Express on Render)
Deploy the API gateway.
1. Click **New +** -> **Web Service** on Render.
2. Select your `fakeshield` repository.
3. Configure the service settings:
   * **Name**: `fakeshield-backend`
   * **Root Directory**: `backend`
   * **Language**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
4. Expand the **Advanced** section to add Environment Variables:
   * `PORT` = `5000`
   * `MONGODB_URI` = *Your MongoDB Atlas connection string from Step 1*
   * `JWT_SECRET` = *A secret key of your choice*
   * `PYTHON_SERVICE_URL` = `https://fakeshield-ai.onrender.com/predict` *(Your AI service URL from Step 2)*
5. Click **Deploy Web Service**.
6. Copy the generated URL (e.g., `https://fakeshield-backend.onrender.com`).

---

## 4. Frontend Deployment (Vite React on Vercel)
Deploy the user interface using [Vercel](https://vercel.com) (free tier).
1. Go to Vercel, sign up, and import your GitHub repository.
2. Configure project settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
3. Expand **Environment Variables** and add the API connection URL:
   * In `frontend/src/services/api.js`, make sure the baseURL is configurable, or update it directly to point to your new backend URL:
     `https://fakeshield-backend.onrender.com/api`
4. Click **Deploy**.
5. Your React application is now live at a public Vercel URL!
