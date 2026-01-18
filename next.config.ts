import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Don't fail build on TypeScript errors during build (but still show them)
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
