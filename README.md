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

### Core Platform
- **🧠 AI Content Generation** — Generate notes, quizzes, flashcards, Q&A from any topic
- **🎯 Difficulty Levels** — Beginner, Intermediate, and Advanced
- **📝 Interactive Quizzes** — Click to answer, instant correct/wrong feedback with explanations
- **🃏 3D Flashcards** — Animated flip cards with front/back
- **📄 PDF Export** — Download any generated content as a formatted PDF
- **🔍 Search & Filter** — Search across all study materials by topic/type

### Auth & Security
- **🔐 Authentication** — Secure sign-in/up via Clerk (Google, Email)
- **🛡️ Rate Limiting** — In-memory sliding window limiter (10 req/min per user)
- **🍪 Cookie Consent** — GDPR-compliant banner with Accept/Decline

### Payments & Subscriptions
- **💳 Credit System** — Free tier (5 credits) + paid plans via Razorpay
- **📊 Subscription Management** — View plan details, credits, upgrade, cancel
- **🔗 Webhook Fallback** — Dual payment verification (client + server webhook)

### Polish & Production
- **📱 Responsive** — Works seamlessly on mobile, tablet, and desktop
- **🛡️ AI Resilience** — Auto-retry with exponential backoff + model fallback chain
- **⚡ Loading Skeletons** — Polished loading states for all pages
- **🗺️ SEO Optimized** — Sitemap, robots.txt, OpenGraph & Twitter metadata
- **📧 Support System** — Contact page & structured bug report form
- **📜 Legal Pages** — Privacy Policy & Terms of Service
- **📈 Analytics Ready** — Pluggable event tracking (Google Analytics / Vercel / PostHog)

---

## 📂 Project Structure

```
ai-powered-exam-learning-platform/
│
├── public/
│   └── team/                                # Branding & Team Assets
│       ├── logo.jpg                         #   Platform logo
│       ├── rahul.jpg                        #   Team member: Rahul
│       ├── charan.jpg                       #   Team member: Charan
│       ├── dakshath.jpg                     #   Team member: Dakshath
│       └── mahesh.jpg                       #   Team member: Mahesh
│
├── src/
│   ├── app/                                 # ─── Next.js App Router ───
│   │   │
│   │   ├── (auth)/                          # Auth Pages
│   │   │   ├── layout.tsx                   #   Centered auth layout with gradient orbs
│   │   │   ├── sign-in/[[...sign-in]]/      #   Clerk Sign-In page
│   │   │   └── sign-up/[[...sign-up]]/      #   Clerk Sign-Up page
│   │   │
│   │   ├── api/                             # Backend API Routes
│   │   │   ├── razorpay/
│   │   │   │   ├── create-order/route.ts    #   POST — Create Razorpay order
│   │   │   │   └── verify/route.ts          #   POST — Verify payment signature
│   │   │   └── webhook/
│   │   │       └── razorpay/route.ts        #   POST — Razorpay webhook (fallback)
│   │   │
│   │   ├── dashboard/                       # Dashboard (Protected)
│   │   │   ├── page.tsx                     #   Main dashboard with profile & history
│   │   │   ├── loading.tsx                  #   Skeleton loader
│   │   │   ├── content/[id]/page.tsx        #   Dynamic content viewer
│   │   │   └── subscription/               #   Subscription Management
│   │   │       ├── page.tsx                 #     Plan details, credits, expiry
│   │   │       ├── actions.ts              #     Server action: cancelSubscription()
│   │   │       └── CancelButton.tsx         #     Client component with confirm dialog
│   │   │
│   │   ├── generate/                        # AI Generation (Protected)
│   │   │   ├── page.tsx                     #   Topic input form
│   │   │   └── actions.ts                  #   Server action: generateContent()
│   │   │
│   │   ├── pricing/                         # Pricing Page (Public)
│   │   │   └── page.tsx                     #   Plans comparison + Razorpay checkout
│   │   │
│   │   ├── contact/                         # Contact / Support (Public)
│   │   │   └── page.tsx                     #   Email form + copy email button
│   │   │
│   │   ├── bug-report/                      # Bug Report (Public)
│   │   │   └── page.tsx                     #   Structured bug form with severity
│   │   │
│   │   ├── privacy/                         # Privacy Policy (Public)
│   │   │   └── page.tsx                     #   7-section legal page
│   │   │
│   │   ├── terms/                           # Terms of Service (Public)
│   │   │   └── page.tsx                     #   9-section legal page
│   │   │
│   │   ├── sitemap.ts                       # SEO: Auto-generated /sitemap.xml
│   │   ├── robots.ts                        # SEO: Auto-generated /robots.txt
│   │   ├── layout.tsx                       # Root layout (Clerk, Splash, Analytics, Cookies)
│   │   ├── page.tsx                         # Landing page
│   │   ├── globals.css                      # Global styles & Tailwind config
│   │   └── favicon.ico                      # App icon
│   │
│   ├── components/                          # ─── Reusable Components ───
│   │   ├── dashboard/
│   │   │   └── DashboardContent.tsx         #   Content grid with search & filters
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx                   #   Top nav (Features, Pricing, Contact)
│   │   │   └── Footer.tsx                   #   Footer (Product, Support, Legal links)
│   │   │
│   │   └── ui/
│   │       ├── AnalyticsProvider.tsx         #   Page view tracker (usePathname)
│   │       ├── Button.tsx                   #   Reusable button (primary/secondary/ghost)
│   │       ├── CookieConsent.tsx            #   GDPR cookie consent banner
│   │       ├── Flashcard.tsx                #   3D animated flip card
│   │       ├── InteractiveQuiz.tsx          #   Quiz interface with scoring
│   │       ├── PDFDocument.tsx              #   PDF layout template
│   │       ├── PDFDownload.tsx              #   Download PDF button
│   │       ├── Skeleton.tsx                 #   Loading skeleton component
│   │       └── SplashScreen.tsx             #   Animated project credits splash
│   │
│   ├── lib/                                 # ─── Core Logic ───
│   │   ├── db/
│   │   │   ├── schema.ts                   #   Drizzle schema (users, content, credits, subs)
│   │   │   └── queries.ts                  #   Database query functions
│   │   ├── db.ts                            #   Neon connection setup
│   │   ├── gemini.ts                        #   Gemini AI integration + retry + fallback
│   │   ├── razorpay.ts                      #   Razorpay SDK + signature verification
│   │   ├── subscription.ts                  #   Subscription access control check
│   │   ├── rate-limit.ts                    #   Sliding window rate limiter
│   │   ├── analytics.ts                     #   Event tracking utility (pluggable)
│   │   └── utils.ts                         #   Shared utility functions
│   │
│   ├── config/
│   │   └── constants.ts                     #   App constants, plans, content types
│   │
│   ├── types/
│   │   ├── index.ts                         #   Shared TypeScript interfaces
│   │   └── razorpay.d.ts                    #   Razorpay Checkout.js type declarations
│   │
│   └── middleware.ts                        #   Clerk auth protection + public routes
│
├── scripts/
│   └── migrate-razorpay.ts                  # DB migration script
│
├── .env.example                             # Environment variables template
├── drizzle.config.ts                        # Drizzle ORM configuration
├── next.config.ts                           # Next.js configuration
├── tsconfig.json                            # TypeScript configuration
├── package.json                             # Dependencies & scripts
├── LICENSE                                  # MIT License
└── README.md                                # This file
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
                     │ cancelled_at       │
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

## 🔒 Security Architecture

| Layer | Mechanism | Details |
|---|---|---|
| **Authentication** | Clerk | OAuth, email/password — no credentials stored locally |
| **Database** | Drizzle ORM | Parameterized queries prevent SQL injection |
| **Payments** | Razorpay + HMAC SHA256 | Server-side signature verification |
| **API Protection** | Rate Limiting | Sliding window: 10 requests/min per user |
| **Content Access** | Row-Level Security | Users can only view their own generated content |
| **Cookies** | GDPR Consent | Cookie consent banner with localStorage preference |

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

- [x] 🧠 AI-powered content generation (Notes, Quiz, Flashcards, Q&A)
- [x] 🔐 Authentication with Clerk (Google OAuth + Email)
- [x] 💳 Payment integration with Razorpay
- [x] 📄 PDF export for all content types
- [x] 📊 Subscription management (view, upgrade, cancel)
- [x] 🛡️ Rate limiting & security hardening
- [x] 🗺️ SEO (sitemap, robots.txt, OpenGraph)
- [x] 📜 Legal compliance (Privacy Policy, Terms, Cookie Consent)
- [x] 📧 Support system (Contact & Bug Report pages)
- [x] 📈 Analytics infrastructure (pluggable provider)
- [ ] 📱 Mobile app (React Native)
- [ ] 🗣️ Voice-based learning
- [ ] ✍️ Handwriting recognition for input
- [ ] 📅 Smart revision schedules
- [ ] 🌐 Multi-language support

---

## 👨‍💻 Development Team

**Data Science Students — CMR University**

- **RAHUL R BAGEWADI** (Lead Developer)
- **CHARAN R**
- **DAKSHATH G N**
- **MAHESH BILAGI**

---

*Built with ❤️ as a Graduation Capstone Project — 2026*

