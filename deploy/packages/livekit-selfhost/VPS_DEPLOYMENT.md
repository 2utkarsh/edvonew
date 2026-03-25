# EDVO Self-Hosted Live VPS Deployment

This guide turns EDVO live classrooms into a fully owned deployment.
The EDVO app stays in this repo, while the media server runs on your VPS.

## Why VPS instead of Vercel for media

Vercel is fine for the EDVO frontend and API layer, but the actual realtime media server should run on a VPS.
Live video rooms need long-lived realtime networking and UDP media ports, which is what the LiveKit server on the VPS provides.

## Recommended minimum for 100 participants

- 4 dedicated vCPU
- 8 GB RAM
- Ubuntu 22.04 or newer
- Public IPv4
- Docker + Docker Compose
- Domain such as `live.edvo.in`

## Ports to open

- `80/tcp`
- `443/tcp` if you terminate SSL at nginx
- `7880/tcp` internal LiveKit websocket target
- `7881/tcp`
- `50000-50100/udp`

## Install Docker on Ubuntu

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Log out and back in after adding your user to the docker group.

## Upload the package

Copy this folder to the VPS:

```text
deploy/packages/livekit-selfhost
```

## Generate secrets

Linux:
```bash
bash ./generate-live-secrets.sh
```

Windows before upload:
```powershell
.\generate-live-secrets.ps1
```

Put the generated values into `.env`.

## Prepare env and config

```bash
cp .env.example .env
bash ./render-livekit-config.sh
```

Set these values in `.env`:

- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `LIVEKIT_PUBLIC_IP`
- `LIVEKIT_DOMAIN`

## Start LiveKit

```bash
docker compose up -d
```

## Reverse proxy

Use [nginx-livekit.conf.example](/e:/EDVO/deploy/packages/livekit-selfhost/nginx-livekit.conf.example) as the starting point.
Your reverse proxy should forward `wss://live.your-domain.com` to `127.0.0.1:7880`.

## Point EDVO to your own live server

Frontend env:

```env
LIVEKIT_URL=wss://live.your-domain.com
LIVEKIT_API_KEY=your-key
LIVEKIT_API_SECRET=your-secret
```

Backend env:

```env
LIVEKIT_URL=wss://live.your-domain.com
LIVEKIT_API_KEY=your-key
LIVEKIT_API_SECRET=your-secret
```

Then redeploy EDVO.

## EDVO flow after setup

- Admin creates a room from `/backend/admin/courses`
- EDVO generates host and student join links automatically
- Host launches from `/live-classroom/[roomName]?entry=host`
- Students join from the generated student link
- Tokens are signed by EDVO using your own keys

## What this is and is not

This is a fully owned deployment path for EDVO live classes.
It uses self-hosted LiveKit as the media backbone, which is the correct way to deliver a Zoom-like classroom without relying on a managed room provider.
It is not a brand-new SFU written from scratch inside this repo, because that would be much slower, riskier, and less production-safe than deploying a hardened open-source SFU you control.
