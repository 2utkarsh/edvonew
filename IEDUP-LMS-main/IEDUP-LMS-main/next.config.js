/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  basePath: '/live',
  assetPrefix: '/live',
  images: {
    formats: ['image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/live',
        permanent: false,
        basePath: false,
      },
    ];
  },
};

module.exports = nextConfig;
