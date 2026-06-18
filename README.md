# FakeShield: Fake News & Neutral Content Detection

FakeShield is a web application designed to classify social media posts into three categories: **Verified (True News)**, **Flagged (Fake News)**, and **General Information (Casual/Neutral Posts)**. The project integrates a React frontend, a Node.js Express backend API, and a Python FastAPI microservice serving an Ensemble Machine Learning model.

## 🚀 Key Features
* **3-Class Classification**: Differentiates between actual verified news, fake news/rumors, and casual/everyday chatter (General Information) to prevent false alerts.
* **Triple-Check Ensemble AI**: Combines Logistic Regression, Multinomial Naive Bayes, and Decision Trees to eliminate single-keyword bias.
* **Interactive Scanning UI**: Features a step-by-step progress scanner simulating fact-checking verification, with real-time confidence scores and color-coded status badges.
* **Resilient Database Fallback**: Dynamically falls back from MongoDB Atlas (cloud) to an in-memory database (`MongoMemoryServer`) if network or configuration issues occur.

---

## 🛠️ Technology Stack
* **Frontend**: React (Vite), Tailwind CSS, Lucide React
* **Backend API**: Node.js, Express.js, Mongoose (MongoDB ODM)
* **AI Microservice**: Python 3.10+, FastAPI, Uvicorn, Scikit-Learn, Joblib

---

## 📁 Project Structure
```text
fakeshield/
├── backend/                # Node.js/Express API Gateway
│   ├── config/             # DB Connection (with local fallback)
│   ├── controllers/        # Route controllers (Auth, Posts, Verification)
│   ├── models/             # Mongoose schemas (User, Post, Comment, VerificationResult)
│   ├── routes/             # API Endpoints
│   └── server.js           # Server startup script
├── frontend/               # React (Vite) User Interface
│   ├── src/
│   │   ├── components/     # PostCard.jsx, VerifyModal.jsx, etc.
│   │   └── App.jsx
│   └── package.json
└── python_service/         # Python AI Prediction Service
    ├── main.py             # FastAPI prediction endpoints
    ├── train.py            # Model training script
    ├── preprocess.py       # Text cleaning utility
    └── indian_news_dataset.csv  # Dataset used for training
```

---

## ⚙️ Setup & Execution Instructions

Ensure you have **Node.js** and **Python** installed on your system.

### 1. Run the Python AI Service
1. Navigate to the `python_service` directory:
   ```bash
   cd python_service
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   python main.py
   ```
   *The service will run at `http://localhost:8000`.*

### 2. Run the Node.js Backend API
1. Navigate to the `backend` directory:
   ```bash
   cd ../backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables inside `.env`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_uri_here
   JWT_SECRET=your_jwt_secret_here
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`. If MongoDB Atlas is unavailable, it will automatically connect to a local in-memory DB.*

### 3. Run the Frontend UI
1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

---

## 📊 Database Models (MongoDB Collections)
1. **User**: Credentials, profiles, and roles.
2. **Post**: Content, author reference, like/comment counters, verification status (`pending`, `verified`, `flagged`, `general`), and confidence score.
3. **Comment**: Comment replies referenced to user and post.
4. **VerificationResult**: Log of all scans, prediction labels, and specific confidence breakdowns.

---

## 🧠 Machine Learning: Why Ensemble Voting?
1. **No Single-Keyword Bias**: Single models can overfit on individual words (e.g. labeling any post with the word "lockdown" or "vaccine" as fake). Averaging predictions from three models prevents this.
2. **Real-time Performance**: Executes on CPUs in milliseconds, avoiding the need for expensive GPU infrastructure required by deep-learning transformers (BERT/GPT).
3. **General Information Class**: Isolates everyday casual social media posts from actual news facts.
