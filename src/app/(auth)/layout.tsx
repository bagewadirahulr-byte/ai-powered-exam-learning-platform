// ============================================
// Auth Layout
// Centers the sign-in/sign-up forms on the page
// ============================================

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid-bg relative flex min-h-screen items-center justify-center px-4">
      {/* Background gradient orbs (matching landing page) */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-[128px] animate-pulse-glow" />
      <div className="pointer-events-none absolute right-1/3 bottom-1/3 h-96 w-96 rounded-full bg-purple-600/20 blur-[128px] animate-pulse-glow" />

      {/* Auth form container */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
