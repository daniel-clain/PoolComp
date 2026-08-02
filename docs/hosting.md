# Hosting on Render

This app runs as one Render **Web Service**.

## Render account and service

- Workspace: `Daniel's workspace`
- Project: `PoolComp`
- Environment: `Production`
- Service: `PoolComp` (Web Service)
- Service URL: [https://poolcomp-wgp1.onrender.com](https://poolcomp-wgp1.onrender.com)

## Render settings

- Root Directory: blank
- Build Command: `npm run build`
  - Equivalent to: `npm --prefix shared install && npm --prefix frontend install && npm --prefix backend install && npm --prefix frontend run build && npm --prefix backend run build`
  - `shared` must be installed too — frontend `tsc` typechecks `shared/` (and, via type imports, some `backend/` files)
- Start Command: `npm --prefix backend run start`

## Environment variable

- `MONGODB_URI` (required)

## Runtime behavior

- Backend serves frontend from `frontend/dist`.
- SPA fallback serves `frontend/dist/index.html`.
- WebSocket endpoint is `/ws`.

## Verify

- Open [https://poolcomp-wgp1.onrender.com](https://poolcomp-wgp1.onrender.com).
- Confirm websocket connects to `/ws`.
- Perform an action and confirm realtime update.
