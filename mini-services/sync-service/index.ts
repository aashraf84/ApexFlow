import { Server } from "socket.io";

// ─── ERP Registry ────────────────────────────────────────────────────────────

interface ErpDefinition {
  slug: string;
  name: string;
}

interface ErpStatus {
  slug: string;
  name: string;
  status: "connected" | "error" | "syncing";
  latency: number;
  clientCount: number;
  lastSyncAt: string | null;
}

const ERP_REGISTRY: ErpDefinition[] = [
  { slug: "apparelflow", name: "ApparelFlow" },
  { slug: "hotelflow", name: "HotelFlow" },
  { slug: "eduflow", name: "EduFlow" },
  { slug: "buildflow", name: "BuildFlow" },
  { slug: "pharmaflow", name: "PharmaFlow" },
  { slug: "travelflow", name: "TravelFlow" },
  { slug: "martflow", name: "MartFlow" },
  { slug: "tenantflow", name: "TenantFlow" },
  { slug: "factoryflow", name: "FactoryFlow" },
  { slug: "foodflow", name: "FoodFlow" },
  { slug: "autoflow", name: "AutoFlow" },
  { slug: "healthflow", name: "HealthFlow" },
  { slug: "textileflow", name: "TextileFlow" },
  { slug: "creativeflow", name: "CreativeFlow" },
  { slug: "logisticflow", name: "LogisticFlow" },
  { slug: "distriflow", name: "DistriFlow" },
  { slug: "fleetflow", name: "FleetFlow" },
  { slug: "electroflow", name: "ElectroFlow" },
  { slug: "bookflow", name: "BookFlow" },
  { slug: "fuelflow", name: "FuelFlow" },
  { slug: "salonflow", name: "SalonFlow" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 1): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function randomDateWithin(hours: number): string {
  const now = Date.now();
  const past = now - randomInt(0, hours * 3600 * 1000);
  return new Date(past).toISOString();
}

/** Build the initial status snapshot for all 21 ERPs. */
function buildInitialStatuses(): Map<string, ErpStatus> {
  const map = new Map<string, ErpStatus>();
  for (const erp of ERP_REGISTRY) {
    // ~90 % connected, ~8 % error, ~2 % syncing at bootstrap
    const roll = Math.random();
    let status: ErpStatus["status"] = "connected";
    if (roll > 0.98) status = "syncing";
    else if (roll > 0.90) status = "error";

    map.set(erp.slug, {
      slug: erp.slug,
      name: erp.name,
      status,
      latency: randomInt(12, 280),
      clientCount: randomInt(1, 48),
      lastSyncAt: status === "error" ? null : randomDateWithin(6),
    });
  }
  return map;
}

/** Mutate statuses in-place: occasionally toggle one to "syncing" or back. */
function tickStatuses(statuses: Map<string, ErpStatus>): void {
  const entries = Array.from(statuses.values());

  for (const entry of entries) {
    // If currently syncing, ~60 % chance to resolve back to connected
    if (entry.status === "syncing" && Math.random() < 0.6) {
      entry.status = "connected";
      entry.lastSyncAt = new Date().toISOString();
    }

    // Small latency jitter (±15 ms)
    entry.latency = Math.max(5, entry.latency + randomInt(-15, 15));

    // Small client-count jitter (±3)
    entry.clientCount = Math.max(0, entry.clientCount + randomInt(-3, 3));
  }

  // ~15 % chance per tick to push a random connected ERP into "syncing"
  if (Math.random() < 0.15) {
    const candidates = entries.filter((e) => e.status === "connected");
    if (candidates.length > 0) {
      const target = candidates[randomInt(0, candidates.length - 1)];
      target.status = "syncing";
    }
  }

  // ~3 % chance to flip an ERP to error
  if (Math.random() < 0.03) {
    const candidates = entries.filter((e) => e.status === "connected");
    if (candidates.length > 0) {
      const target = candidates[randomInt(0, candidates.length - 1)];
      target.status = "error";
      target.lastSyncAt = null;
    }
  }

  // ~5 % chance to recover an errored ERP
  if (Math.random() < 0.05) {
    const candidates = entries.filter((e) => e.status === "error");
    if (candidates.length > 0) {
      const target = candidates[randomInt(0, candidates.length - 1)];
      target.status = "connected";
      target.lastSyncAt = new Date().toISOString();
    }
  }
}

function computeSummary(statuses: Map<string, ErpStatus>) {
  const all = Array.from(statuses.values());
  const connected = all.filter((e) => e.status === "connected").length;
  const errors = all.filter((e) => e.status === "error").length;
  const syncing = all.filter((e) => e.status === "syncing").length;
  const totalLatency = all.reduce((s, e) => s + e.latency, 0);
  const totalClients = all.reduce((s, e) => s + e.clientCount, 0);

  return {
    total: all.length,
    connected,
    errors,
    syncing,
    avgLatency: parseFloat((totalLatency / all.length).toFixed(1)),
    totalClients,
    timestamp: new Date().toISOString(),
  };
}

// ─── Server Bootstrap ────────────────────────────────────────────────────────

const PORT = 3031;

const io = new Server(PORT, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  // Ringbuffer so late-joining clients still get the last few status broadcasts
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
  },
});

const statuses = buildInitialStatuses();
const statusIntervals = new Map<string, ReturnType<typeof setInterval>>();

console.log(`[sync-service] ApexFlow Sync Service listening on port ${PORT}`);

// ─── Connection Lifecycle ────────────────────────────────────────────────────

io.on("connection", (socket) => {
  console.log(`[sync-service] Client connected: ${socket.id}`);

  // Immediately send current state so the client doesn't wait 5 s
  socket.emit("erp:status", Array.from(statuses.values()));
  socket.emit("erp:summary", computeSummary(statuses));

  // Start periodic status broadcasting for this socket
  const statusTimer = setInterval(() => {
    tickStatuses(statuses);
    const snapshot = Array.from(statuses.values());
    const summary = computeSummary(statuses);

    socket.emit("erp:status", snapshot);
    socket.emit("erp:summary", summary);
  }, 5000);

  statusIntervals.set(socket.id, statusTimer);

  // ── erp:trigger-sync ────────────────────────────────────────────────────
  socket.on("erp:trigger-sync", () => {
    console.log(`[sync-service] Sync triggered by ${socket.id}`);

    // Immediately acknowledge
    socket.emit("erp:sync-started", {
      timestamp: new Date().toISOString(),
      triggeredBy: socket.id,
    });

    // Simulate work for 2-3 seconds
    const delay = randomInt(2000, 3000);

    setTimeout(() => {
      const syncedCount = randomInt(14, 21);
      const failedSlugs: string[] = [];

      // Pick a few random slugs to mark as "failed"
      const allSlugs = ERP_REGISTRY.map((e) => e.slug);
      for (let i = 0; i < allSlugs.length - syncedCount; i++) {
        const idx = randomInt(0, allSlugs.length - 1);
        if (!failedSlugs.includes(allSlugs[idx])) {
          failedSlugs.push(allSlugs[idx]);
        }
      }

      // Update internal statuses — mark all as connected after sync
      for (const [, entry] of statuses) {
        if (!failedSlugs.includes(entry.slug)) {
          entry.status = "connected";
          entry.lastSyncAt = new Date().toISOString();
        }
      }

      socket.emit("erp:sync-complete", {
        timestamp: new Date().toISOString(),
        syncedCount,
        failedCount: failedSlugs.length,
        failedSlugs,
        duration: delay,
      });

      // Also push updated summary
      socket.emit("erp:summary", computeSummary(statuses));
    }, delay);
  });

  // ── erp:test-connection ─────────────────────────────────────────────────
  socket.on("erp:test-connection", (data: { slug?: string }) => {
    const slug = data?.slug;
    if (!slug) {
      socket.emit("erp:test-result", {
        slug: "unknown",
        success: false,
        latency: 0,
        error: "Missing slug",
      });
      return;
    }

    const erpDef = ERP_REGISTRY.find((e) => e.slug === slug);
    if (!erpDef) {
      socket.emit("erp:test-result", {
        slug,
        success: false,
        latency: 0,
        error: `Unknown ERP: ${slug}`,
      });
      return;
    }

    console.log(`[sync-service] Testing connection for ${slug} (client ${socket.id})`);

    // Simulate 1-2 second connection test
    const latency = randomInt(18, 350);
    const delay = randomInt(1000, 2000);

    setTimeout(() => {
      // ~90 % success rate
      const success = Math.random() < 0.9;

      // Update internal status on success
      if (success) {
        const entry = statuses.get(slug);
        if (entry) {
          entry.status = "connected";
          entry.latency = latency;
          entry.lastSyncAt = new Date().toISOString();
        }
      }

      socket.emit("erp:test-result", {
        slug,
        name: erpDef.name,
        success,
        latency,
        timestamp: new Date().toISOString(),
      });
    }, delay);
  });

  // ── Disconnect ──────────────────────────────────────────────────────────
  socket.on("disconnect", (reason) => {
    console.log(`[sync-service] Client disconnected: ${socket.id} (${reason})`);
    const timer = statusIntervals.get(socket.id);
    if (timer) {
      clearInterval(timer);
      statusIntervals.delete(socket.id);
    }
  });
});

// ─── Graceful Shutdown ───────────────────────────────────────────────────────

function shutdown() {
  console.log("[sync-service] Shutting down…");
  for (const [, timer] of statusIntervals) {
    clearInterval(timer);
  }
  statusIntervals.clear();
  io.close(() => {
    console.log("[sync-service] Goodbye.");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);