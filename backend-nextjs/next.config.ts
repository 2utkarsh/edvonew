import type { NextConfig } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/backend';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath,
};

export default nextConfig;
