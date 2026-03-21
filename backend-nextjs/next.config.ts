import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // No basePath for standalone backend API
  typescript: {
    ignoreBuildErrors: true,
  },
  // Admin panel routes
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/admin/page.html',
      },
      {
        source: '/admin/dashboard',
        destination: '/admin/dashboard/page.html',
      },
      {
        source: '/admin/courses',
        destination: '/admin/courses/page.html',
      },
    ];
  },
};

export default nextConfig;
