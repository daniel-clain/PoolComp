---
name: single_render_service_migration
overview: Move PoolComp to a single Render Web Service where the backend serves the built frontend, with build orchestration defined in Render settings (not package scripts).
todos:
  - id: serve-static-from-backend
    content: Add express static serving and SPA fallback in backend index.ts
    status: completed
  - id: align-env-config
    content: Ensure frontendDistPath config defaults and env usage match single-service deployment
    status: completed
  - id: configure-render-service
    content: Set Render build/start commands and environment variables for root-based unified build
    status: completed
  - id: verify-deployment
    content: Validate frontend serving, websocket flow, deep-link refresh, and data actions in production
    status: completed
  - id: retire-old-service
    content: Remove the separate frontend static service after cutover
    status: completed
isProject: false
---

# Single Render Web Service Migration Plan

## Goal
Run one Render Web Service only, build frontend and backend in the same pipeline, and serve frontend assets from the backend process.

## Code Changes

- Update backend server startup in [d:\Repos\PoolComp\backend\src\index.ts](d:\Repos\PoolComp\backend\src\index.ts):
  - Serve static files from `serverConfig.frontendDistPath`.
  - Add SPA fallback route to return `index.html` for non-API/non-WS paths.
  - Keep websocket path `/ws` unchanged.
- Keep environment config centralized in [d:\Repos\PoolComp\backend\src\config.ts](d:\Repos\PoolComp\backend\src\config.ts):
  - Retain required: `MONGODB_URI`.
  - Retain optional: `PORT`, `MONGO_DB_NAME`.
  - Keep `FRONTEND_DIST_PATH` but set Render value to a deterministic path from repo root (`frontend/dist`).
- Do not add render build scripts to [d:\Repos\PoolComp\backend\package.json](d:\Repos\PoolComp\backend\package.json) since you chose Render-command-only orchestration.

## Render Pipeline Configuration

- Use one Web Service (repo root as working directory).
- Build command (root-level command chain):
  - install backend deps
  - install frontend deps
  - build frontend
  - build backend
- Start command:
  - run backend compiled entry (`backend/dist/backend/src/index.js`).
- Environment variables (Web Service):
  - `MONGODB_URI` (required)
  - `MONGO_DB_NAME` (optional; default already in code)
  - `PORT` (optional; Render injects automatically)
  - `FRONTEND_DIST_PATH=frontend/dist`

## Validation Steps

- Deploy Web Service and confirm logs show backend starts and websocket listens.
- Open service URL and verify frontend HTML/JS is served.
- Verify websocket connects to same origin (`/ws`) and receives `allData`.
- Execute one user action (for example add player) and confirm live updates.
- Validate deep-link refresh works (SPA fallback returning `index.html`).

## Cleanup

- Decommission old Render static frontend service after successful verification.
- Remove any frontend-only Render env variables no longer needed (for example `VITE_WS_URL` if frontend uses same-origin `/ws`).

## Render Checklist

- Create/confirm single Web Service
- Set Root Directory to repo root
- Set Build Command in Render (no repo script changes)
- Set Start Command to backend dist entry
- Set env vars (`MONGODB_URI`, optional `MONGO_DB_NAME`, `FRONTEND_DIST_PATH=frontend/dist`)
- Deploy and verify logs + app + websocket
- Delete old frontend static service