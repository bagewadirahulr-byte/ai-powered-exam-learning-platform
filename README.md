# ExamAI — AI-Powered Exam Learning Platform

> Generate comprehensive study notes, quizzes, flashcards, and Q&A instantly using Google Gemini AI.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **AI** | Google Gemini 2.5 Flash (free tier) |
| **Database** | Neon PostgreSQL + Drizzle ORM |
| **Auth** | Clerk |
| **Payments** | Stripe |
| **Styling** | Tailwind CSS |
| **Hosting** | Vercel |

## Features

- 🧠 **AI Content Generation** — Notes, Quizzes, Flashcards, Q&A
- 🎯 **Difficulty Levels** — Beginner, Intermediate, Advanced
- 📄 **PDF Export** — Download study materials as PDF
- 🔐 **Auth** — Sign in/up with Clerk
- 💳 **Credits System** — Free tier + paid plans via Stripe
- 📱 **Responsive** — Works on desktop and mobile

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Sign-in / Sign-up pages
│   ├── api/stripe/             # Stripe checkout + webhook
│   ├── dashboard/              # Dashboard + content viewer
│   ├── generate/               # AI generation page + actions
│   ├── pricing/                # Pricing page
│   ├── layout.tsx              # Root layout (Clerk + fonts)
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles + design tokens
├── components/
│   ├── layout/                 # Navbar, Footer
│   └── ui/                     # Button, Skeleton, PDF components
├── config/
│   └── constants.ts            # Credits, plans, content types
├── lib/
│   ├── db/                     # Schema + queries (Drizzle)
│   ├── db.ts                   # Neon connection setup
│   ├── gemini.ts               # Gemini AI client
│   ├── stripe.ts               # Stripe client
│   └── utils.ts                # Utility functions
├── types/
│   └── index.ts                # TypeScript interfaces
└── middleware.ts                # Clerk auth middleware
```

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/bagewadirahulr-byte/ai-powered-exam-learning-platform.git
cd ai-powered-exam-learning-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your keys (see .env.example for details)

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

See [`.env.example`](.env.example) for all required variables:

- **Clerk** — Authentication (publishable + secret keys)
- **Neon** — PostgreSQL database URL
- **Gemini** — Google AI API key (free tier)
- **Stripe** — Payment processing (secret + webhook + publishable keys)

## Roadmap

- 📱 Mobile app (React Native)
- 🗣️ Voice-based learning
- ✍️ Handwriting recognition
- 📅 Smart revision schedules
- 🌐 Multi-language support
- 🤖 Advanced AI modules

---

Built with ❤️ by Rahul R Bagewadi
