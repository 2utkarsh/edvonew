/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/live';
const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || basePath;

const nextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  turbopack: {
    root: __dirname,
  },
  basePath,
  assetPrefix,
  images: {
    formats: ['image/webp'],
  },
  async redirects() {
    if (!basePath) return [];
    return [
      {
        source: '/',
        destination: basePath,
        permanent: false,
        basePath: false,
      },
    ];
  },
};

module.exports = nextConfig;
