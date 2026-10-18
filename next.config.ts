import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker/App Runner deployment
  output: "standalone",

  // Playwright drives a real browser for the private /live page; never bundle it
  serverExternalPackages: ["playwright", "playwright-core"],

  // Disable image optimization for App Runner compatibility
  // (App Runner doesn't support Next.js image optimization service)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
