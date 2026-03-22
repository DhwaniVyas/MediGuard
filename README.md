# MediGuard — Advanced AI Health Shield 🛡️

MediGuard is a next-generation, AI-assisted health awareness React application. It combines traditional algorithmic diagnostics with modern Generative AI to provide users with a comprehensive medical safety net. From calculating disease probabilities to shielding users from dangerous drug interactions, MediGuard brings clinical-grade logic to a sleek, user-friendly interface.

## ✨ Core Features

### 🩺 Hybrid AI Symptom Checker
- **Checklist Mode**: Select from 40+ categorized symptoms to get algorithmic predictions using weighted F1-score math against local datasets.
- **AI Fallback**: Describe symptoms in plain natural language (e.g., "radiating pain in left arm"). Powered by **Google Gemini 2.5-Flash**, the engine interprets text and identifies obscure diseases outside the local database.
- **Visual Analytics**: Interactive probability charts rendered via Recharts for clear diagnostic hierarchy.

### 💊 Intelligent Medicine Compatibility
- **Database Cross-Reference**: Instantly flags conflicts between any two medications in our 1,400+ record local database.
- **AI-Powered Pharmacology**: Query obscure or new medications. The **Gemini AI Engine** analyzes the drug's chemical properties and contraindications in real-time.
- **Detailed Analysis**: Provides a human-readable "Detailed Analysis" explaining exactly why medicines interact (Active Ingredients, Drug Families, etc.).

### 🛡️ Cross-Tool Allergy Shield
- **Proactive Protection**: Fully integrated with your **Supabase Profile**.
- **Loud Flagging**: Both the Symptom Checker and the Compatibility Tool will forcibly cross out medications and issue a **"HIGH RISK: ALLERGY TRIGGER"** warning if a drug matches your saved allergic profile.

### 📰 Real-time Health Intelligence
- **Locked Health News**: A debounced search engine locked strictly to the `health` category via NewsAPI.
- **Deep Search**: Query global medical journals and health headlines with real-time feedback.

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite (Lightning-fast HMR).
- **AI Engine**: Google Generative AI (@google/generative-ai) using **Gemini 2.5-Flash**.
- **Backend / Database**: **Supabase** (PostgreSQL + Row Level Security).
- **Styling**: Vanilla CSS (Premium Custom Design System).
- **Data Visuals**: Recharts (Risk Gauges & Data Histograms).
- **Processing**: PapaParse (CSV Parsing) & NewsAPI.

## 🚀 Setup & Installation

### 1. Installation
```bash
npm install
```

### 2. Environment Variables (`.env`)
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_NEWS_API_KEY=your_news_api_key
VITE_GEMINI_API_KEY=your_google_ai_studio_key
```

### 3. Required Data
Ensure `src/assets/symptom.csv` and `src/assets/medicine.csv` are present. These power the local core of the application.

### 4. Launch
```bash
npm run dev
```

---
*Disclaimer: MediGuard is an informational tool. It analyzes potential interactions and diagnoses based on public data and AI interpretation. It is NOT a replacement for a licensed physician. Always consult a doctor before starting new medication.*
