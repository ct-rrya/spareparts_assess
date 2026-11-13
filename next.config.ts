import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: {
    // allow local and external product image urls without next/image domain errors
    unoptimized: true,
  },
};

export default nextConfig;

