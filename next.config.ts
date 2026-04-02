import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'localhost',
    'localhost:3000',
    '10.0.26.142',
    '10.0.26.142:3000',
    '10.0.26.240',
    '10.0.26.240:3000',
    '192.168.1.3',
    '192.168.1.3:3000',
  ],
  // @ts-ignore
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
