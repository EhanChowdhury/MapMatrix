import type { NextConfig } from "next";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.10.10.101", "localhost:3001"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
