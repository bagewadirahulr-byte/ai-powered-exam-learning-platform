// ============================================
// Footer Component
// Simple footer with copyright and links
// ============================================

import Link from "next/link";
import { APP_NAME } from "@/config/constants";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gray-950 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 overflow-hidden border border-white/10">
                <img src="/team/logo.jpg" alt="APP_NAME" className="h-full w-full object-cover" onError={(e) => { if (e.currentTarget.src.includes('.jpg')) e.currentTarget.src = '/team/logo.png'; }} />
              </div>
              <span className="text-lg font-bold text-white">{APP_NAME}</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-gray-400">
              AI-Powered Exam Learning Platform. Generate notes, quizzes,
              flashcards, and Q&A using AI for exam preparation.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Built with Next.js, Tailwind CSS & Gemini AI
          </p>
        </div>
      </div>
    </footer>
  );
}
