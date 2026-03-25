/** @type {import('next').NextConfig} */
const configuredBackendBaseUrl =
  process.env.BACKEND_URL ||
  (/^https?:\/\//.test(process.env.NEXT_PUBLIC_BACKEND_URL || '') ? process.env.NEXT_PUBLIC_BACKEND_URL : '') ||
  'http://localhost:3001';

const backendBaseUrl = configuredBackendBaseUrl.replace(/\/$/, '');
const configuredLiveKitProxyTarget =
  process.env.LIVEKIT_PROXY_TARGET ||
  (/^https?:\/\//.test(process.env.NEXT_PUBLIC_LIVEKIT_PROXY_TARGET || '')
    ? process.env.NEXT_PUBLIC_LIVEKIT_PROXY_TARGET
    : '');
const liveKitProxyTarget = configuredLiveKitProxyTarget.replace(/\/$/, '');

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
    const rewrites = [
      {
        source: '/backend/:path*',
        destination: `${backendBaseUrl}/backend/:path*`,
      },
    ];

    if (liveKitProxyTarget) {
      rewrites.push({
        source: '/livekit/:path*',
        destination: `${liveKitProxyTarget}/:path*`,
      });
    }

    return rewrites;
  },
};

module.exports = nextConfig;
