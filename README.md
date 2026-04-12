# 🚀 ExamAI: Mission-Driven Exam Preparation Platform

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16+-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
</div>

<br />

**ExamAI** is a premium, production-grade EdTech platform architected to democratize education for Indian government exam aspirants. Powered by Google's Gemini AI, Next.js App Router, and Edge computing, ExamAI delivers context-aware study material while enforcing robust social impact guardrails.

---

## 🏗️ Architecture & Core Features

### 🧠 The Core AI Engine
- **Context-Locked Generation:** Automatically crafts syllabus-compliant Notes, Interactive Quizzes, and Q&A pairs locked to the user's specific target exam (UPSC, SSC CGL, IBPS, RRB NTPC).
- **Vernacular Intelligence:** Dynamically prompts Gemini to respond in 7 Indian regional languages, maximizing accessibility for non-English speakers.
- **Topic Key DB Caching:** Implements a strict `content_cache` table avoiding redundant LLM generation loops, accelerating load times to <2.5s while saving exponential API costs.

### 🛡️ Social Impact & Identity Layers
- **Zero-Retention EWS Verification:** Processes Economically Weaker Section (EWS) income certificates via Gemini Vision for instant profile upgrades. The image remains strictly in volatile RAM and is automatically wiped after verification.
- **Hardware-Agnostic Anti-Sybil:** Generates a secure device-cookie fingerprint locking aggressive free-tier exploitation without requiring massive tracking overhead.
- **Mental Wellness Enforcement:** Proactively monitors student burnout via daily Emoji check-ins and an automated 2-hour continuous study lockdown, safely forcing students into an AI-guided Break Room (Breathing Exercises & Audio Recovery).

### ⚡ Premium Study Environment
- **3D Interactive Flashcards:** Deeply immersive, GPU-accelerated CSS `rotateY` flashcards featuring dynamic, UI-responsive context emojis.
- **Strict Sectional Prompts:** Replicates the brutal reality of actual IBPS/SSC exams with 1-min-per-question strict auto-submit timers and native real-time negative marking algorithms.
- **Offline PWA Engine:** Complete offline support structure deployed via Service Workers (`sw.js`) and `<meta>` App Manifests, allowing rural students to install the platform seamlessly on low-tier smartphones.
- **Web Speech Native TTS:** Accessibility-first text-to-speech integration instantly narrating complex AI topics using localized BCP-47 Bionic Reading logic.

---

## 🛠️ Technology Stack Breakdown

| Layer | Technology | Decision Rationale |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Elite Server-Side Rendering (SSR) limits payload sizes, crucial for rural India internet conditions. |
| **Database** | Neon (PostgreSQL) | Serverless edge persistence scaling down to 0 costs when idle, providing enterprise Drizzle ORM capabilities. |
| **Authentication** | Clerk | Instant, biometric-ready passwordless authentication stripping development login overhead. |
| **Billing** | Razorpay / Stripe | Localized INR subscriptions mapped to Clerk webhooks to instantly unlock EWS and Annual passes. |
| **AI LLM** | Google Gemini (SDK) | Unmatched multi-modal reasoning capabilities specifically trained heavily on massive technical syllabi. |

---

## ⚙️ How to Deploy Locally

To clone the deployment into your local workspace, simply follow these steps:

```bash
# 1. Clone the Architecture
git clone https://github.com/bagewadirahulr-byte/ai-powered-exam-learning-platform.git
cd ai-powered-exam-learning-platform

# 2. Install Infrastructure Dependencies
npm install

# 3. Synchronize Neon Database Types
npx drizzle-kit push

# 4. Boot Dev Server
npm run dev
```

*Required `.env.local` Variables:* `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `GEMINI_API_KEY`.

---

<p align="center">
  <i>Developed for the upcoming Capstone Senior Defense panel.</i>
</p>
