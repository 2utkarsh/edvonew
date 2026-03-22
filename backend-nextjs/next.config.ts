import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // No basePath for standalone backend API
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable CORS for frontend
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
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
