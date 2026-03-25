# Self-Hosted Live Classroom

This package gives EDVO its own live meeting backend instead of depending on a pasted third-party room URL.
The EDVO app already knows how to generate room links and mint participant tokens. This package provides the missing room server.

## What it is

- `livekit/livekit-server` as the SFU room server
- `redis` for LiveKit coordination
- one generated `livekit.yaml` built from your `.env`
- helper scripts to generate strong LiveKit secrets
- VPS deployment guidance and nginx reverse-proxy starter config
- a deployment path that is realistic for roughly 100 concurrent participants on a properly sized VPS or cloud VM

## Important architecture note

EDVO can stay on Vercel for the website and token APIs if you want, but the actual live media server should run on a VPS.
That means:

- EDVO frontend/backend: Vercel or VPS
- Live media server: VPS
- Domain example: `wss://live.edvo.in`

## Minimum production sizing

- 4 vCPU
- 8 GB RAM
- public IPv4
- open TCP `7880`, TCP `7881`, and UDP `50000-50100`
- reverse proxy or DNS for `wss://live.your-domain.com`

For bigger webinars, larger rooms, or unstable mobile networks, scale the VPS and add stricter monitoring.

## Files

- `.env.example`: values you control
- `livekit.yaml.template`: rendered into final config
- `render-livekit-config.ps1`: Windows renderer
- `render-livekit-config.sh`: Linux/macOS renderer
- `generate-live-secrets.ps1`: Windows secret generator
- `generate-live-secrets.sh`: Linux/macOS secret generator
- `docker-compose.yml`: starts Redis + LiveKit
- `nginx-livekit.conf.example`: reverse-proxy starter config
- `VPS_DEPLOYMENT.md`: deployment checklist for a real server

## Quick start

1. Copy `.env.example` to `.env`.
2. Generate your own key and secret.
3. Set `LIVEKIT_PUBLIC_IP` and `LIVEKIT_DOMAIN`.
4. Render the config.
5. Start the stack.

Windows:
```powershell
cd deploy\packages\livekit-selfhost
Copy-Item .env.example .env
.\generate-live-secrets.ps1
.\render-livekit-config.ps1
```

Linux:
```bash
cd deploy/packages/livekit-selfhost
cp .env.example .env
bash ./generate-live-secrets.sh
bash ./render-livekit-config.sh
```

Start it:
```bash
docker compose up -d
```

## Connect EDVO to this server

Frontend env in `e:\EDVO\.env.local`:
```env
LIVEKIT_URL=wss://live.your-domain.com
LIVEKIT_API_KEY=your-key
LIVEKIT_API_SECRET=your-secret
```

Backend env in `e:\EDVO\backend-nextjs\.env.local`:
```env
LIVEKIT_URL=wss://live.your-domain.com
LIVEKIT_API_KEY=your-key
LIVEKIT_API_SECRET=your-secret
```

You can set the keys on either frontend or backend, but keeping them on both is the safest deployment path for the current EDVO fallback flow.
If you want the browser to connect through the same Vercel app URL, use proxy mode instead:

```env
LIVEKIT_URL=wss://your-project.vercel.app/livekit
LIVEKIT_PROXY_TARGET=https://your-vps-livekit-host
LIVEKIT_API_KEY=your-key
LIVEKIT_API_SECRET=your-secret
```

The Vercel-facing `/livekit/*` path is now supported by [next.config.js](/e:/EDVO/next.config.js).

## How this fits EDVO now

- Admin creates a room name in `/backend/admin/courses`
- EDVO generates host and student launch links automatically
- Host opens `/live-classroom/[roomName]?entry=host`
- Students open the generated student link
- Token minting happens through EDVO API routes using your own key and secret

## Production checklist

- use a VPS, not a serverless runtime, for the media server
- point a subdomain like `live.edvo.in` to that VPS
- configure nginx with [nginx-livekit.conf.example](/e:/EDVO/deploy/packages/livekit-selfhost/nginx-livekit.conf.example)
- add SSL on the live subdomain
- put the same LiveKit URL/key/secret into EDVO frontend and backend env
- redeploy EDVO after setting env

## Important note

This is a fully owned deployment path for EDVO live classes.
It uses self-hosted LiveKit as the media backbone, which is the right way to support a 100-person classroom without depending on a managed room provider.
Writing a custom WebRTC SFU from zero inside this repo would take much longer and would be less reliable than deploying a hardened open-source SFU you control.

