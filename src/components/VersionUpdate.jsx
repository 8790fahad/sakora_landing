import { useCallback, useEffect, useState } from "react";
import { APP_UPDATE_RETURN_KEY, APP_VERSION, shouldPromptUpdate } from "../version";

const CHECK_MS = 5 * 60 * 1000;
const DEV_APPLIED_KEY = "sakora-dev-applied-version";

function versionInUse() {
  if (import.meta.env.DEV) {
    const applied = sessionStorage.getItem(DEV_APPLIED_KEY);
    if (applied) return applied;
  }
  return APP_VERSION;
}

function basePrefix() {
  const base = import.meta.env.BASE_URL || "/";
  return base.endsWith("/") ? base : `${base}/`;
}

function versionUrl() {
  const file = import.meta.env.DEV ? "version.local.json" : "version.json";
  return `${basePrefix()}${file}`;
}

const noCache = {
  cache: "no-store",
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
};

async function readPublishedVersion() {
  const url = new URL(
    `${basePrefix()}__app_update_${Date.now()}`,
    window.location.origin
  );
  const response = await fetch(url.toString(), noCache);
  const html = await response.text();
  const match = html.match(
    /name=["']app-version["'][^>]*content=["']([^"']+)["']/i
  );
  return match?.[1]?.trim() || "";
}

async function loadLatestVersion() {
  if (import.meta.env.DEV) {
    const response = await fetch(`${versionUrl()}?t=${Date.now()}`, noCache);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("version check failed");
    return response.json();
  }
  const published = await readPublishedVersion();
  if (published) return { version: published, forceUpdate: true };
  const response = await fetch(`${versionUrl()}?t=${Date.now()}`, noCache);
  if (!response.ok) throw new Error("version check failed");
  return response.json();
}

async function applyAppUpdate(acceptedVersion) {
  if (import.meta.env.DEV && acceptedVersion) {
    sessionStorage.setItem(DEV_APPLIED_KEY, acceptedVersion);
  }
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(async (registration) => {
          try {
            await registration.update();
          } catch {
            /* already stale */
          }
          await registration.unregister();
        })
      );
    }
  } catch {
    /* no service worker */
  }

  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    /* Cache Storage unavailable */
  }

  if (import.meta.env.DEV) {
    const url = new URL(window.location.href);
    url.searchParams.set("v", String(Date.now()));
    window.location.replace(url.toString());
    return;
  }

  const here = new URL(window.location.href);
  here.searchParams.delete("v");
  sessionStorage.setItem(
    APP_UPDATE_RETURN_KEY,
    `${here.pathname}${here.search}${here.hash}`
  );
  const next = new URL(
    `${basePrefix()}__app_update_${Date.now()}`,
    window.location.origin
  );
  window.location.replace(next.toString());
}

export default function VersionUpdate() {
  const [serverVersion, setServerVersion] = useState("");
  const [applying, setApplying] = useState(false);

  const check = useCallback(async () => {
    try {
      const payload = await loadLatestVersion();
      if (!payload || !shouldPromptUpdate(versionInUse(), payload)) {
        setServerVersion("");
        return;
      }
      setServerVersion(String(payload.version).trim());
    } catch {
      // A failed check must not block the site.
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("v")) {
      url.searchParams.delete("v");
      const next = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState({}, "", next);
    }
  }, []);

  useEffect(() => {
    check();
    const timer = window.setInterval(check, CHECK_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [check]);

  if (!serverVersion) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="app-update-title"
      aria-describedby="app-update-desc"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 23, 42, 0.55)",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          background: "#fff",
          padding: 24,
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.18)",
          fontFamily: "inherit",
        }}
      >
        <img src="/brand.svg" alt="" width="40" height="40" style={{ marginBottom: 16 }} />
        <h2 id="app-update-title" style={{ margin: 0, fontSize: 18, color: "#0f172a" }}>
          New version available
        </h2>
        <p id="app-update-desc" style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.5, color: "#475569" }}>
          A new version is available. Update to continue with the latest copy of Sakora.
        </p>
        <p style={{ margin: "12px 0 0", fontSize: 12, color: "#94a3b8" }}>
          This copy {versionInUse()} · Latest {serverVersion}
        </p>
        <button
          type="button"
          autoFocus
          disabled={applying}
          onClick={() => {
            setApplying(true);
            applyAppUpdate(serverVersion);
          }}
          style={{
            marginTop: 20,
            height: 44,
            width: "100%",
            border: 0,
            borderRadius: 12,
            background: "#0f766e",
            color: "#fff",
            fontWeight: 700,
            cursor: applying ? "default" : "pointer",
            opacity: applying ? 0.6 : 1,
          }}
        >
          {applying ? "Updating…" : "Update now"}
        </button>
      </div>
    </div>
  );
}
