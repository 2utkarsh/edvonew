#!/usr/bin/env bash
set -euo pipefail

bytes="${1:-32}"
api_key="edvo-live-$(tr -dc 'a-z0-9' </dev/urandom | head -c 8)"
api_secret="$(openssl rand -hex "$bytes")"

echo "LIVEKIT_API_KEY=${api_key}"
echo "LIVEKIT_API_SECRET=${api_secret}"
