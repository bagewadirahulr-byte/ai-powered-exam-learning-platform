// ============================================
// Analytics Utility — Event Tracking
// Lightweight analytics stub, swappable with
// Google Analytics, Vercel Analytics, or PostHog
// ============================================

type EventName =
  | "page_view"
  | "content_generated"
  | "payment_initiated"
  | "payment_completed"
  | "subscription_cancelled"
  | "bug_report_submitted"
  | "contact_form_opened";

/**
 * Track a user event.
 * In development, events are logged to the console.
 * In production, replace the body with your analytics provider.
 */
export function trackEvent(
  event: EventName,
  properties?: Record<string, string | number | boolean>
) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${event}`, properties || "");
  }

  // -------------------------------------------------------
  // Production integration examples:
  //
  // Google Analytics:
  //   if (typeof window !== 'undefined' && window.gtag) {
  //     window.gtag('event', event, properties);
  //   }
  //
  // Vercel Analytics:
  //   import { track } from '@vercel/analytics';
  //   track(event, properties);
  //
  // PostHog:
  //   posthog.capture(event, properties);
  // -------------------------------------------------------
}

/**
 * Track a page view event.
 */
export function trackPageView(path: string) {
  trackEvent("page_view", { path });
}
