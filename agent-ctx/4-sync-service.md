# Task 4 — sync-service Agent

## Summary
Created a standalone Bun + socket.io mini-service at `/home/z/my-project/mini-services/sync-service/` that provides real-time ERP status, sync triggering, and connection testing via WebSocket.

## Files Created
- `mini-services/sync-service/package.json` — Package definition with `socket.io` dep, `bun --hot` dev script
- `mini-services/sync-service/index.ts` — Full socket.io server on port 3031

## What It Does
1. **`erp:status`** (every 5s) — Broadcasts array of 21 ERP status objects with `slug`, `name`, `status`, `latency`, `clientCount`, `lastSyncAt`. Statuses jitter each tick (~15% chance one ERP flips to "syncing", ~3% to "error", ~5% recover from error).
2. **`erp:summary`** (every 5s) — Emits aggregated stats: total, connected, errors, syncing, avgLatency, totalClients.
3. **`erp:trigger-sync`** → Immediately emits `erp:sync-started`, then after 2-3s emits `erp:sync-complete` with mock results (synced count, failed slugs, duration).
4. **`erp:test-connection`** (`{ slug }`) → After 1-2s emits `erp:test-result` with `{ slug, name, success, latency, timestamp }`.

## Verification
- `bun install` resolved `socket.io@4.8.3`
- Server starts and binds port 3031 successfully
- Graceful shutdown on SIGINT/SIGTERM

## Frontend Usage
```ts
import { io } from "socket.io-client";
const socket = io("/?XTransformPort=3031");
```