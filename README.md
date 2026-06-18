# FakeShield: An AI-Driven Social Network Intelligence System for Fake News Detection, Cyber Threat Analysis, and IoT-Based Real-Time Alerts

FakeShield is an advanced, self-contained social media intelligence platform where users can register, login, create posts, like/comment, and interact. The key innovation is an integrated real-time AI verification system that analyzes content posted within the platform.

---

## 🌟 Social Media Platform Features
* **User Registration & Login**: Secured with JWT-based authentication.
* **User Profiles**: View stats, details, and posts.
* **Interactive Feed**: Create posts, view other users' posts, search content, like posts, and write comments.
* **Verify Post Button**: Initiates the multi-layered AI threat detection process on any post in the feed.

---

## 🧠 Core System Modules

### 🛡️ Module 1: Fake News Detection
* **Purpose**: Detect whether the textual content of a post is real or fake.
* **Pipeline**: Text cleaning, tokenization, stopword removal, TF-IDF vectorization, and SVM (Support Vector Machine) classifier model.
* **Output**: Fake/True prediction and confidence percentage.

### 🛡️ Module 2: Cyber Threat Detection
* **Purpose**: Detect phishing URLs and malicious links inside posts.
* **Pipeline**: Regular expression URL extraction, URL feature analysis (length, subdomain count, presence of IP address, suspicious keywords), and danger prediction classification (Safe, Suspicious, Malicious).

### 🛡️ Module 3: Bot Detection
* **Purpose**: Detect suspicious users and bot-like automated behavior.
* **Pipeline**: Analyzes posting frequency, comment frequency, like patterns, repeated text content, and models user relations as an interaction graph using **NetworkX Graph Analytics**.

### 🛡️ Module 4: Risk Engine
* **Purpose**: Combines all threat metrics into a single unified risk indicator.
* **Weighted Formula**:
  $$\text{Risk Score} = (0.5 \times \text{FakeScore}) + (0.3 \times \text{ThreatScore}) + (0.2 \times \text{BotScore})$$
* **Risk Levels**: Low Risk, Medium Risk, High Risk, Critical Risk.

### 🛡️ Module 5: Verification Report
* **Purpose**: Displays an interactive modal report summarizing:
  - Fake News Prediction & Confidence
  - URL Threat Result
  - Bot Analysis Result
  - Unified Risk Score & Level (Low/Medium/High/Critical)

### 🛡️ Module 6: Explainable AI (XAI)
* **Purpose**: Provides transparency beyond binary labels.
* **Output**: Shows trigger keywords that contributed most to the prediction, the confidence score, and clear explanations.

### 🛡️ Module 7: Admin Dashboard
* **Purpose**: Allows administrators to audit system-wide security metrics.
* **Visualizations**: Interactive Pie, Bar, and Line charts displaying:
  - Total users and posts
  - Fake posts and security threats detected
  - Suspicious bot accounts and verification requests

### 🛡️ Module 8: IoT Alert System
* **Purpose**: Integrates an external ESP32 microcontroller for physical security notifications.
* **Indicators**:
  - **Low Risk**: Green LED
  - **Medium Risk**: Yellow LED
  - **High/Critical Risk**: Red LED (+ active Piezo Buzzer for critical status)

---

## 📊 Database Collections
* **Users**: Profile info, credentials, and settings.
* **Posts**: Content, author references, status, and threat metrics.
* **Comments**: Post replies linked to user and post.
* **Likes**: Post likes linked to users for bot interaction mapping.
* **VerificationResults**: Log of all scans, scores, and final classifications.
* **ThreatReports**: Extracted URL features and threat prediction details.
* **BotAnalysis**: Log of user activity metrics and graph statistics.
* **Alerts**: History of IoT signals triggered by high-risk content.
