# Hosting on Render

This app runs as two Render services:

1. Backend: **Web Service**
2. Frontend: **Static Site**

The frontend must know the backend websocket URL at build time through `VITE_WS_URL`.

## 1) Deploy backend (Web Service)

Use these settings:

- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

Set environment variables:

- `MONGODB_URI` (required)
- `MONGO_DB_NAME` (optional, default is `PoolComp`)
- Do not set `PORT` manually on Render (Render provides it)

After deploy, copy the backend public URL:

- Example backend URL: `https://poolcomp-api.onrender.com`
- Websocket URL for frontend: `wss://poolcomp-api.onrender.com/ws`

(`wss` + same host + `/ws`)

## 2) Deploy frontend (Static Site)

Use these settings:

- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

Set this environment variable on the Static Site:

- `VITE_WS_URL=wss://<your-backend-host>.onrender.com/ws`

Important: this value is baked in when Render runs the frontend build. If you change `VITE_WS_URL`, redeploy the Static Site.

## Local development env file

`frontend/.env` is only for local development and currently contains:

- `VITE_DEV_BACKEND_PORT=3000`

That variable is used only by Vite local dev proxy. It is not used for Render production hosting.

## Quick check after both deploys

- Open the frontend Render URL.
- In browser devtools Network tab (WS), confirm connection to `wss://<backend-host>/ws`.
