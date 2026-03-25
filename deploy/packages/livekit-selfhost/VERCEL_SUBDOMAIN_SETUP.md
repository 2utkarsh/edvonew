# Vercel Live URL Setup For EDVO

This guide covers two supported ways to keep EDVO on Vercel while the actual LiveKit media server runs on a VPS.

## Important architecture note

- EDVO pages can stay on Vercel
- EDVO token APIs can stay on Vercel
- The actual LiveKit media server should still run on a VPS

That means you have two practical URL styles:

1. Dedicated live subdomain
- App page: `https://your-project.vercel.app/live-classroom/room-name`
- LiveKit URL: `wss://live.yourdomain.com`

2. Same-origin Vercel path proxy
- App page: `https://your-project.vercel.app/live-classroom/room-name`
- LiveKit URL: `wss://your-project.vercel.app/livekit`
- Vercel rewrite target: `LIVEKIT_PROXY_TARGET=https://your-vps-livekit-host`

## Option 1: dedicated subdomain

Use this when you have your own domain.

1. Create a DNS record pointing a subdomain like `live.yourdomain.com` to the VPS.
2. Put SSL on that subdomain.
3. Set env:

```env
LIVEKIT_URL=wss://live.yourdomain.com
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret
```

## Option 2: same-origin Vercel path

Use this when you want the browser to connect through your Vercel app URL instead of a separate visible live subdomain.

1. Keep the real LiveKit server on the VPS.
2. Set Vercel env:

```env
LIVEKIT_URL=wss://your-project.vercel.app/livekit
LIVEKIT_PROXY_TARGET=https://your-vps-livekit-host
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret
```

3. Redeploy the Vercel app.

The repo now includes a rewrite for `/livekit/:path*` in [next.config.js](/e:/EDVO/next.config.js).

## What to enter in Vercel env

Frontend project:

```env
LIVEKIT_URL=wss://your-project.vercel.app/livekit
LIVEKIT_PROXY_TARGET=https://your-vps-livekit-host
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret
```

Backend project or backend server:

```env
LIVEKIT_URL=wss://your-project.vercel.app/livekit
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret
```

If your backend is not running behind the same Vercel app, you can also keep the backend `LIVEKIT_URL` as the direct VPS/domain websocket URL.

## VPS side still required

Even in same-origin proxy mode, the VPS still hosts the real LiveKit server.
Use these files:

- [README.md](/e:/EDVO/deploy/packages/livekit-selfhost/README.md)
- [VPS_DEPLOYMENT.md](/e:/EDVO/deploy/packages/livekit-selfhost/VPS_DEPLOYMENT.md)
- [docker-compose.yml](/e:/EDVO/deploy/packages/livekit-selfhost/docker-compose.yml)
- [nginx-livekit.conf.example](/e:/EDVO/deploy/packages/livekit-selfhost/nginx-livekit.conf.example)

## Summary

If you want the user-facing connection to look like it comes from the Vercel app URL, use:

```env
LIVEKIT_URL=wss://your-project.vercel.app/livekit
LIVEKIT_PROXY_TARGET=https://your-vps-livekit-host
```

This keeps the app on Vercel while still using a real VPS-hosted media backend.
