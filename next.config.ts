import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
