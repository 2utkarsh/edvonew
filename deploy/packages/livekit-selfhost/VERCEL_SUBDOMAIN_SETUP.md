# Vercel Subdomain Setup For EDVO Live

This guide is for the case where your main EDVO app is on Vercel and the live media server is on a VPS.
The goal is to point a subdomain like `live.edvo.in` to the VPS running the self-hosted LiveKit stack.

## Architecture

- EDVO web app: Vercel or VPS
- EDVO token/API routes: Vercel or VPS
- Live media server: VPS
- Live URL used by EDVO: `wss://live.edvo.in`

## If your domain uses Vercel nameservers

1. Open your Vercel dashboard.
2. Go to the team/project that owns `edvo.in`.
3. Open `Domains`.
4. Make sure `edvo.in` is added and using Vercel DNS.
5. Add a DNS record:
   - Type: `A`
   - Name: `live`
   - Value: `YOUR_VPS_PUBLIC_IP`
6. Wait for DNS propagation.

You can also do it with Vercel CLI:

```bash
vercel dns add edvo.in live A YOUR_VPS_PUBLIC_IP
```

## If your domain is not using Vercel nameservers

Add the subdomain at your registrar or DNS provider instead:

- Type: `A`
- Host/Name: `live`
- Value: `YOUR_VPS_PUBLIC_IP`

## After DNS is added

1. Install nginx or your preferred reverse proxy on the VPS.
2. Use [nginx-livekit.conf.example](/e:/EDVO/deploy/packages/livekit-selfhost/nginx-livekit.conf.example) as the base config.
3. Add SSL for `live.edvo.in`.
4. Start the LiveKit stack from [docker-compose.yml](/e:/EDVO/deploy/packages/livekit-selfhost/docker-compose.yml).
5. Put the same values into these local env files:
   - [e:\EDVO\.env.local](/e:/EDVO/.env.local)
   - [e:\EDVO\backend-nextjs\.env.local](/e:/EDVO/backend-nextjs/.env.local)

Example:

```env
LIVEKIT_URL=wss://live.edvo.in
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret
```

## Important note

The `live.edvo.in` subdomain is not a new Vercel deployment URL.
It is a custom DNS subdomain that should point to your VPS, because the actual realtime media server should run there.
