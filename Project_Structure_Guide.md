# ExamAI — Project Structure & VS Code Directory Guide

This document provides a comprehensive breakdown of the application's underlying structural architecture.

## 1. Complete Directory Tree

```text
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
│   │       ├── AnalyticsProvider.tsx        #   Page view tracker (usePathname)
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
└── README.md                                # General project readme
```

---

## 2. Directory & Architecture Explanations

In a modern Next.js 16 (App Router) application, organizing files logically is crucial for maintainability and edge-computing performance. Here is exactly what each section of VS Code represents and why they are separated.

### 📁 `/public`
**Purpose**: Hosts static assets that are served directly to the browser without being processed by Webpack or Turbopack.
**Why it's here**: High-quality images (like your `team/` branding assets, team photos, and the primary logo) are placed here so they can be securely and rapidly delivered via Next.js's caching mechanisms without increasing our JavaScript bundle size.

### 📁 `/src/app` (The Next.js App Router)
**Purpose**: This directory handles **routing**, **backend APIs**, and **Core Pages**. Any folder with a `page.tsx` file inside of it automatically becomes a visible URL route (e.g., `/dashboard`).
*   `/(auth)`: The parenthesis indicate a **route group**. This allows the sign-in and sign-up pages to share an entirely different underlying layout (gradient orbs) without affecting the URL structure.
*   `/api`: This folder acts as our isolated Backend server. Code in here (like the `/api/razorpay/` webhooks) executes purely on the server, safely allowing us to process cryptographic signatures without exposing secret keys to the browser.
*   `/dashboard & /generate`: These are our protected operational routes. The `/dashboard/content/[id]` folder uses **Dynamic Routing**, meaning it securely resolves custom IDs in the URL on the fly. Notice that `/generate/actions.ts` sits directly next to the page—this is a **Server Action**, a highly efficient Next.js feature allowing our client UI to securely call complex server functions (Gemini AI requests) without having to build a manual HTTP `/api/` endpoint for it.

### 📁 `/src/components`
**Purpose**: Houses isolated, reusable UI code that makes up the visual structure of the application.
*   `/layout`: Contains structural frameworks like `Navbar.tsx` and `Footer.tsx` which wrap the entire application across all pages.
*   `/ui`: Holds standalone atomic components. For example, `PDFDocument.tsx` strictly controls PDF formatting, `Flashcard.tsx` handles complex 3D flipping logic, and `SplashScreen.tsx` contains interactive animations. Because these are abstracted into the `components` directory, they can be utilized multiple times across completely different pages cleanly.

### 📁 `/src/lib`
**Purpose**: The central nervous system of our backend operations and integrations. 
*   `/db`: Contains `schema.ts` (defining the exact architecture of our PostgreSQL tables) and `queries.ts` (holding complex SQL abstraction logic). Keeping DB queries here ensures our UI components stay lightweight and secure.
*   `gemini.ts`: The dedicated integration file for Google's API, housing our extensive retry logic and fallback mechanisms to handle rate-limiting.
*   `razorpay.ts`: Isolated utility file dedicated entirely to processing financial handshakes securely.
*   `rate-limit.ts`: Security middleware logic used to throttle user requests to prevent spam.

### 📁 `/src/config` & `/src/types`
**Purpose**: Strongly typing and standardizing the application.
*   `/config/constants.ts` stores rigid application data (like plan pricing or subscription tiers) so if prices need to change, it is altered in *one* file rather than hunting through 50 UI components.
*   `/types` defines strict TypeScript interfaces (e.g., razorpay declaration schemas). This helps the IDE catch bugs and variable mismatches during development before the code even executes in the browser.

### 📄 Configuration Files (Root Level)
*   `middleware.ts`: The first interceptor for all app requests. It utilizes Clerk to immediately block unauthorized internet traffic from accessing protected routes (`/dashboard`) before the page even attempts to load.
*   `package.json`: Contains the manifesto of every NPM dependency installed in the project (React, Drizzle, Tailwind, Clerk) and custom run commands (`npm run dev`).
*   `drizzle.config.ts`: Tells the Drizzle database management system how to securely read the PostgreSQL schema to run migrations safely without data loss. 
*   `.env.example`: Provides a template for server administrators mapping what API secrets (Clerk, Neon, Razorpay, Gemini) the application requires to boot successfully.
