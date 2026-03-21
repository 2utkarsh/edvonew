import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // No basePath for standalone backend API
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
