---
name: Realtime multiplayer stack
description: How Socket.io, the Vite proxy, and PostgreSQL are wired together for realtime presence and posts.
---

## Architecture
- Socket.io server runs on the API server (port 8080) with `path: '/api/socket.io'`
- Vite dev server has `server.proxy['/api']` → `http://localhost:8080` with `ws: true` so WebSocket upgrades are proxied too
- Frontend connects with `io({ path: '/api/socket.io' })` — no explicit host needed, same-origin through proxy
- Presence is in-memory (Map<socketId, PresenceUser>) on the server; resets on restart
- Posts are persisted in PostgreSQL (postsTable in lib/db) and broadcast to all clients via `getIO().emit('post:created/updated/deleted')`

**Why:** Path-based proxy avoids CORS issues and cross-origin WebSocket handshake failures in Replit's proxied iframe environment.

**How to apply:** Any new realtime features should use `getIO()` from `artifacts/api-server/src/lib/socket.ts` to broadcast. Client listeners go in PostsContext or RealtimeContext depending on what data they affect.
