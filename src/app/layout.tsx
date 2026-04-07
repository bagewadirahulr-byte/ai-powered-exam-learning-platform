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
  keywords: [
    "AI",
    "exam preparation",
    "study notes",
    "quiz generator",
    "flashcards",
    "learning platform",
    "Gemini AI",
  ],
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
            baseTheme: dark, // Match our dark theme
            variables: {
              colorPrimary: "#3b82f6",       // Blue-500
              colorBackground: "#111827",     // Gray-900
              colorInputBackground: "#1f2937", // Gray-800
              colorText: "#f9fafb",           // Gray-50
            },
            elements: {
              // Style Clerk components to match our design
              card: "bg-gray-900 border border-white/10 shadow-xl",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              formButtonPrimary:
                "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
              footerActionLink: "text-blue-400 hover:text-blue-300",
              formFieldInput:
                "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500",
              dividerLine: "bg-gray-700",
              dividerText: "text-gray-500",
              socialButtonsBlockButton:
                "bg-gray-800 border-gray-700 text-white hover:bg-gray-700",
              socialButtonsBlockButtonText: "text-white",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
