// ============================================
// Navbar Component — With Clerk Auth
// Shows: Logo, nav links, Auth buttons/UserButton
// ============================================

"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import Button from "@/components/ui/Button";
import { APP_NAME } from "@/config/constants";

export default function Navbar() {
  // --- Get auth state (client-side) ---
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 shadow-lg shadow-blue-500/30 overflow-hidden border border-white/10">
            <img src="/team/logo.jpg" alt="APP_NAME" className="h-full w-full object-cover" onError={(e) => { if (e.currentTarget.src.includes('.jpg')) e.currentTarget.src = '/team/logo.png'; }} />
          </div>
          <span className="text-xl font-bold text-white">{APP_NAME}</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/#features"
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            How It Works
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            Pricing
          </Link>
        </div>

        {/* Auth Buttons — powered by Clerk */}
        <div className="flex items-center gap-3">
          {!isLoaded ? (
            // Loading skeleton while Clerk initializes
            <div className="h-9 w-24 animate-pulse rounded-xl bg-gray-800" />
          ) : isSignedIn ? (
            // Signed in: show Dashboard link + UserButton
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              />
            </>
          ) : (
            // Signed out: show Sign In + Sign Up buttons
            <>
              <SignInButton mode="redirect">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <Button variant="primary" size="sm">
                  Get Started Free
                </Button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
