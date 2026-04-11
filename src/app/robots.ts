// ============================================
// Robots.txt — SEO Configuration
// Auto-generated at /robots.txt
// ============================================

import type { MetadataRoute } from "next";
import { APP_URL } from "@/config/constants";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = APP_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/api/",
          "/generate/",
          "/sign-in/",
          "/sign-up/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
