// Public-safe adaptation of a production resilience mechanism from Darrow Code Insight.
// When a deployment replaces hashed JavaScript assets, an already-open browser
// tab can request a chunk that no longer exists. A guarded reload recovers the
// customer session while the cooldown prevents repeated reload attempts.

const RELOAD_KEY = "__darrow_stale_chunk_reload_at";
const COOLDOWN_MS = 10_000;

function shouldReload(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || "0");
    if (Number.isFinite(last) && Date.now() - last < COOLDOWN_MS) {
      return false;
    }
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    return true;
  } catch {
    // Without durable cooldown state, reloading could create a loop for a
    // persistent network or chunk-loading failure. Fail closed instead.
    return false;
  }
}

function looksLikeStaleChunk(message: string): boolean {
  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /ChunkLoadError/i.test(message) ||
    /Loading chunk .* failed/i.test(message) ||
    /Loading CSS chunk .* failed/i.test(message)
  );
}

function handle(message: unknown) {
  const text = typeof message === "string" ? message : String((message as Error)?.message ?? message);
  if (!looksLikeStaleChunk(text)) return;
  if (!shouldReload()) return;
  console.warn("[stale-chunk-reload] detected stale chunk, reloading:", text);
  window.location.reload();
}

export function installStaleChunkReload() {
  if (typeof window === "undefined") return;

  const runtime = window as Window & { __darrowStaleChunkInstalled?: boolean };
  if (runtime.__darrowStaleChunkInstalled) return;
  runtime.__darrowStaleChunkInstalled = true;

  window.addEventListener("vite:preloadError", (event: Event) => {
    event.preventDefault();
    handle((event as Event & { payload?: Error }).payload?.message ?? "vite:preloadError");
  });

  window.addEventListener("error", (event) => {
    handle(event.message || event.error);
  });

  window.addEventListener("unhandledrejection", (event) => {
    handle(event.reason);
  });
}
