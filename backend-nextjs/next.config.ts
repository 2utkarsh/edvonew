import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // No basePath for standalone backend API
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/backend/api/:path*',
        destination: '/api/:path*',
      },
      {
        source: '/backend/admin',
        destination: '/admin',
      },
      {
        source: '/backend/admin/login',
        destination: '/admin',
      },
      {
        source: '/backend/admin/dashboard',
        destination: '/admin/dashboard',
      },
      {
        source: '/backend/admin/courses',
        destination: '/admin/courses',
      },
      {
        source: '/backend/admin/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
};

export default nextConfig;
