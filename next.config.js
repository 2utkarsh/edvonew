/** @type {import('next').NextConfig} */
const backendBaseUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '');

const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  devIndicators: false,

  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'codebasics.io',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: `${backendBaseUrl}/backend/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
