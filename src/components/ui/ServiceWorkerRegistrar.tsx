"use client";

import { useEffect } from "react";

// ============================================
// Service Worker Registrar for PWA Offline Mode
// ============================================

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
             // Silently registered
          })
          .catch((error) => {
             // Silently failed
          });
      });
    }
  }, []);

  return null;
}
