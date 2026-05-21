# Vercel Deployment

## Required setup

This app can run on Vercel, but LiveKit must be reachable from the public internet.

Use one of these:

- LiveKit Cloud
- A self-hosted LiveKit server with a public `https://` and `wss://` endpoint

`ws://localhost:7880` will not work on Vercel.

## Environment variables

Add these in the Vercel project settings:

```env
LIVEKIT_URL=wss://your-project.livekit.cloud
# Optional if you want to set the server API host explicitly:
# LIVEKIT_API_URL=https://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
JWT_SECRET=replace-with-a-long-random-secret
MONGODB_URI=mongodb+srv://username:password@cluster.example/livekit_meeting?retryWrites=true&w=majority
NEXT_PUBLIC_CONN_DETAILS_ENDPOINT=/api/connection-details
NEXT_PUBLIC_SHOW_SETTINGS_MENU=false
```

If you enable recordings, also add:

```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_S3_BUCKET=...
LIVEKIT_RECORDING_LAYOUT=grid
```

## Notes

- `LIVEKIT_URL` is used for browser room connections.
- `LIVEKIT_API_URL` is optional. When omitted, the app derives it automatically from `LIVEKIT_URL`.
- If you set `LIVEKIT_URL=https://...`, the app converts it to `wss://...` for the browser.
- If you set `LIVEKIT_URL=wss://...`, the app converts it to `https://...` for server-side LiveKit API calls.
- Meetings need a real MongoDB database in production. Use MongoDB Atlas or another hosted MongoDB instance.

## Deploy

1. Import the repo into Vercel.
2. Set the environment variables above for Production and Preview.
3. Redeploy the project.
4. Open the deployed URL and test room creation and join flow.

## LiveKit Cloud

LiveKit's docs note that production apps should generate tokens on your own backend, and LiveKit Cloud is the managed deployment option where the main code change is the URL your app connects to.
