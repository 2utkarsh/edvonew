# Self-Hosted Live Classroom

This package gives EDVO its own live meeting backend instead of depending on a pasted third-party room URL.
The EDVO app already knows how to generate room links and mint participant tokens. This package provides the missing room server.

## What it is

- `livekit/livekit-server` as the SFU room server
- `redis` for LiveKit coordination
- one generated `livekit.yaml` built from your `.env`
- a deployment path that is realistic for roughly 100 concurrent participants on a properly sized VPS or cloud VM

## Minimum production sizing

- 4 vCPU
- 8 GB RAM
- public IPv4
- open TCP `7880`, TCP `7881`, and UDP `50000-50100`
- reverse proxy or DNS for `wss://live.your-domain.com`

For very unstable mobile networks or strict office NATs, add TURN separately. The current package is the fastest self-hosted starting point and works well when the LiveKit node has open UDP ports.

## Files

- `.env.example`: values you control
- `livekit.yaml.template`: rendered into final config
- `render-livekit-config.ps1`: Windows renderer
- `render-livekit-config.sh`: Linux/macOS renderer
- `docker-compose.yml`: starts Redis + LiveKit

## Setup

1. Copy `.env.example` to `.env`.
2. Replace `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_PUBLIC_IP`, and `LIVEKIT_DOMAIN`.
3. Render the config.

Windows:
```powershell
cd deploy\packages\livekit-selfhost
Copy-Item .env.example .env
.\render-livekit-config.ps1
```

Linux:
```bash
cd deploy/packages/livekit-selfhost
cp .env.example .env
bash ./render-livekit-config.sh
```

4. Start the stack.

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

## How this fits EDVO now

- Admin creates a room name in `/backend/admin/courses`
- EDVO generates host and student launch links automatically
- Host opens `/live-classroom/[roomName]?entry=host`
- Students open the generated student link
- Token minting happens through EDVO API routes using your own key and secret

## Important note

This is a self-hosted LiveKit deployment, which is the right way to support a 100-person classroom without rebuilding a new SFU from scratch.
Writing a custom WebRTC SFU from zero inside this repo would take far longer and would be less reliable than using a hardened open-source media server you control.
