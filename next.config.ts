import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure server-only packages are not bundled into client/edge bundles
  serverExternalPackages: ["@neondatabase/serverless", "razorpay", "node-edge-tts"],
};

export default nextConfig;
