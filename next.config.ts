import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.replit.dev",
    "*.replit.app",
    process.env.REPLIT_DEV_DOMAIN,
  ].filter((origin): origin is string => Boolean(origin)),
  trailingSlash: true,
  images: { unoptimized: true },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        path: false,
        fs: false,
        child_process: false,
        crypto: false,
        url: false,
        module: false,
      };
    }
    return config;
  },
};

export default nextConfig;
