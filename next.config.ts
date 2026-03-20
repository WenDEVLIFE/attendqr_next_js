import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['10.0.26.240', '192.168.1.3'],
  // @ts-ignore
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
