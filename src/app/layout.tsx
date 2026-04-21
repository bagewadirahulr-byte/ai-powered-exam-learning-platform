// ============================================
// Root Layout — Updated with ClerkProvider
// AI-Powered Exam Learning Platform
// ============================================

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import { APP_NAME, APP_DESCRIPTION, APP_URL } from "@/config/constants";
import SplashScreen from "@/components/ui/SplashScreen";
import CookieConsent from "@/components/ui/CookieConsent";
import AnalyticsProvider from "@/components/ui/AnalyticsProvider";
import ServiceWorkerRegistrar from "@/components/ui/ServiceWorkerRegistrar";

// --- Google Font: Inter ---
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// --- SEO Metadata ---
export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — AI-Powered Exam Learning Platform`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  keywords: [
    "AI",
    "exam preparation",
    "study notes",
    "quiz generator",
    "flashcards",
    "learning platform",
    "Gemini AI",
    "UPSC preparation",
    "SSC CGL",
    "IBPS exam",
    "RRB NTPC",
    "government exam",
    "EWS students",
    "free education",
    "AI tutor",
  ],
  openGraph: {
    type: "website",
    title: `${APP_NAME} — AI-Powered Exam Learning Platform`,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — AI-Powered Exam Learning Platform`,
    description: APP_DESCRIPTION,
  },
};

// --- Root Layout ---
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-950 font-sans antialiased">
        {/* ClerkProvider wraps the entire app for auth context */}
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#3b82f6",         // Blue-500
              colorBackground: "#0f172a",       // Slate-900 (Professional dark)
              colorInputBackground: "#1e293b",   // Slate-800
              colorText: "#ffffff",             // Strict bright white for all primary text
              colorTextSecondary: "#94a3b8",    // Slate-400 for secondary text
              colorTextOnPrimaryBackground: "#ffffff",
              colorNeutral: "#ffffff",          // Fixes black text on some neutral elements
            },
            elements: {
              // Only override specific buttons, do NOT override 'card' as it breaks popover text
              formButtonPrimary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium",
              footerActionLink: "text-blue-400 hover:text-blue-300 font-medium",
              socialButtonsBlockButton: "bg-slate-800 border-slate-700 text-white hover:bg-slate-700",
              socialButtonsBlockButtonText: "text-white font-medium",
              formFieldInput: "bg-slate-800 border-slate-700 text-white placeholder:text-slate-400",
              // Force popover buttons to have white text
              userButtonPopoverActionButtonText: "text-white font-medium",
              userButtonPopoverActionButtonIcon: "text-slate-300",
              userPreviewMainIdentifier: "text-white font-semibold",
              userPreviewSecondaryIdentifier: "text-slate-400",
            },
          }}
        >
          <SplashScreen />
          <AnalyticsProvider />
          <CookieConsent />
          <ServiceWorkerRegistrar />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
