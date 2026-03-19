/** @type {import('pm2').EcosystemConfig} */
// NOTE: This file is for VPS/local use only.
// For cPanel hosting, deploy the frontend to Vercel instead.
// See deploy/FULL_STACK_DEPLOYMENT.md
module.exports = {
  apps: [
    {
      name: 'edvo-frontend',
      cwd: './deploy/packages/frontend-node-app',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Set BACKEND_URL in .env.local or here:
        // BACKEND_URL: 'https://api.yourdomain.com',
      },
    },
  ],
};
