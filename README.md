# 🧠 ExamAI — AI-Powered Exam Learning Platform

> Generate comprehensive study notes, quizzes, flashcards, and Q&A instantly using Google Gemini AI. Built as a capstone project demonstrating full-stack development with modern web technologies.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge&logo=vercel)](https://ai-powered-exam-learning-platform.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)

---

## 📌 Problem Statement

Traditional exam preparation involves manually creating study materials, which is time-consuming and inconsistent. Students need a tool that can **instantly generate structured, high-quality study content** from any topic — tailored to their difficulty level.

## 💡 Solution

**ExamAI** leverages Google's Gemini AI to generate four types of study materials on demand:

| Content Type | Description |
|---|---|
| 📝 **Notes** | Structured study notes with headings and detailed explanations |
| ❓ **Quizzes** | Interactive MCQs with instant feedback, scoring, and explanations |
| 🃏 **Flashcards** | 3D flip cards for quick concept revision |
| 💬 **Q&A** | Important questions with detailed model answers |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) | Server-side rendering, file-based routing |
| **Language** | TypeScript | Type-safe development |
| **AI** | Google Gemini 2.5 Flash | Content generation with JSON mode |
| **Database** | Neon PostgreSQL + Drizzle ORM | Serverless database with type-safe queries |
| **Auth** | Clerk | Authentication & user management |
| **Payments** | Razorpay | Indian payment gateway (UPI, Cards, Net Banking) |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with dark glassmorphism theme |
| **PDF Export** | @react-pdf/renderer | Client-side PDF generation |
| **Hosting** | Vercel | Serverless deployment with auto CI/CD |

---

## ✨ Key Features

- **🧠 AI Content Generation** — Generate notes, quizzes, flashcards, Q&A from any topic
- **🎯 Difficulty Levels** — Beginner, Intermediate, and Advanced
- **📝 Interactive Quizzes** — Click to answer, instant correct/wrong feedback with explanations
- **🃏 3D Flashcards** — Animated flip cards with front/back
- **📄 PDF Export** — Download any generated content as a formatted PDF
- **🔍 Search & Filter** — Search across all study materials by topic/type
- **🔐 Authentication** — Secure sign-in/up via Clerk (Google, Email)
- **💳 Credit System** — Free tier (5 credits) + paid subscription plans via Razorpay
- **📱 Responsive** — Works seamlessly on mobile, tablet, and desktop
- **🛡️ AI Resilience** — Auto-retry with exponential backoff + model fallback chain
- **⚡ Loading Skeletons** — Polished loading states for all pages

---

## 📂 Project Structure

```
ai-powered-exam-learning-platform/
│
├── public/
│   ├── team/                             # Branding and Team Assets
│   │   ├── logo.jpg                      #   Platform Logo
│   │   ├── rahul.jpg                     #   Team member: Rahul
│   │   ├── charan.jpg                    #   Team member: Charan
│   │   ├── dakshath.jpg                  #   Team member: Dakshath
│   │   └── mahesh.jpg                    #   Team member: Mahesh
│
├── src/
│   ├── app/                              # Next.js App Router (Pages & API)
│   │   ├── (auth)/                       # Auth pages (Sign In / Sign Up)
│   │   ├── api/                          # Backend API Routes
│   │   ├── dashboard/                    # User Dashboard & Content History
│   │   ├── generate/                     # AI Generation Page & Logic
│   │   ├── pricing/                      # Subscription plans & Checkout
│   │   ├── layout.tsx                    # Root layout with Splash Screen
│   │   └── page.tsx                      # Landing page
│   │
│   ├── components/                       # Reusable React Components
│   │   ├── dashboard/
│   │   ├── layout/
│   │   └── ui/
│   │       ├── SplashScreen.tsx          #   Animated project credits splash
│   │       ├── Flashcard.tsx             #   3D animated components
│   │       └── ...
│   │
│   ├── lib/                              # Core Logic (AI, DB, Payments)
│   │   ├── db/                           #   Drizzle database schema
│   │   ├── gemini.ts                     #   AI Model integration
│   │   ├── razorpay.ts                   #   Payment logic
│   │   └── subscription.ts              #   Access control
│   │
│   └── middleware.ts                     # Clerk Auth Protection
│
├── scripts/
│   └── migrate-razorpay.ts              # DB Setup Script
│
├── .env.example                          # Secret keys template
├── package.json                          # Main config
└── README.md                             # Documentation
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Accounts on: [Clerk](https://clerk.com), [Neon](https://neon.tech), [Google AI Studio](https://aistudio.google.com), [Razorpay](https://razorpay.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/bagewadirahulr-byte/ai-powered-exam-learning-platform.git
cd ai-powered-exam-learning-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Open .env.local and fill in your API keys

# 4. Push database schema to Neon
npm run db:push

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Available Scripts

| Script | Command | Description |
|---|---|---|
| Dev Server | `npm run dev` | Start local development server |
| Build | `npm run build` | Create production build |
| Start | `npm run start` | Run production server |
| Lint | `npm run lint` | Run ESLint |
| DB Push | `npm run db:push` | Push schema to Neon database |
| DB Studio | `npm run db:studio` | Open Drizzle Studio (DB GUI) |

---

## 🗄️ Database Schema

```
┌──────────────┐     ┌────────────────────┐     ┌──────────────┐
│    users      │     │ generated_content  │     │   credits     │
├──────────────┤     ├────────────────────┤     ├──────────────┤
│ id (PK)      │◄────│ user_id (FK)       │     │ id (PK)      │
│ clerk_id     │     │ type (enum)        │     │ user_id (FK) │
│ email        │     │ topic              │     │ amount       │
│ name         │     │ content (JSONB)    │     │ reason       │
│ image_url    │     │ created_at         │     │ razorpay_id  │
│ sub_status   │     └────────────────────┘     │ created_at   │
│ created_at   │                                └──────────────┘
│ updated_at   │     ┌────────────────────┐
└──────────────┘     │  subscriptions     │
       │             ├────────────────────┤
       └────────────►│ user_id (FK, UQ)   │
                     │ razorpay_order_id  │
                     │ razorpay_payment_id│
                     │ plan (enum)        │
                     │ period_end         │
                     └────────────────────┘
```

---

## 💳 Subscription Plans

| Plan | Price | Credits | Duration |
|---|---|---|---|
| 🆓 Free | ₹0 | 5 (one-time) | Forever |
| 📦 Monthly | ₹199 | 50/month | 1 month |
| ⭐ Half-Yearly | ₹499 | 50/month | 6 months |
| 💎 Annual | ₹999 | Unlimited | 12 months |

---

## 🔒 Environment Variables

See [`.env.example`](.env.example) for all required variables:

| Service | Variables | Dashboard |
|---|---|---|
| **Clerk** | `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [clerk.com](https://dashboard.clerk.com) |
| **Neon DB** | `DATABASE_URL` | [neon.tech](https://console.neon.tech) |
| **Gemini AI** | `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **Razorpay** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | [razorpay.com](https://dashboard.razorpay.com) |

---

## 🗺️ Roadmap

- [ ] 📱 Mobile app (React Native)
- [ ] 🗣️ Voice-based learning
- [ ] ✍️ Handwriting recognition for input
- [ ] 📅 Smart revision schedules
- [ ] 🌐 Multi-language support
- [ ] 📊 Performance analytics dashboard

---

## 👨‍💻 Development Team

**Data Science Students — CMR University**

- **RAHUL R BAGEWADI** (Lead Developer)
- **CHARAN R**
- **DAKSHATH G N**
- **MAHESH BILAGI**

---

*Built with ❤️ as a Graduation Capstone Project — 2026*
