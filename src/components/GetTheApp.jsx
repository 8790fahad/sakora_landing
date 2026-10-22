import {
  APP_STORE_URL,
  DESKTOP_MAC_URL,
  DESKTOP_WINDOWS_URL,
  PLAY_STORE_URL,
} from "../config";

function visitorSystem() {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  const platform = navigator.userAgentData?.platform || navigator.platform || "";
  const iPad = /Mac/i.test(platform) && navigator.maxTouchPoints > 1;
  if (/Android/i.test(ua) || /Android/i.test(platform)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua) || iPad) return "ios";
  if (/Win/i.test(platform) || /Windows/i.test(ua)) return "windows";
  if (/Mac/i.test(platform) || /Macintosh|Mac OS/i.test(ua)) return "mac";
  return "other";
}

function Badge({ href, kicker, title, mark, external, download }) {
  return (
    <a
      className="store-badge"
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      {...(download ? { download } : {})}
    >
      <span className="badge-mark" aria-hidden="true">
        {mark}
      </span>
      <span>
        <small>{kicker}</small>
        <strong>{title}</strong>
      </span>
    </a>
  );
}

export default function GetTheApp() {
  const system = visitorSystem();
  const known = system !== "other";
  const showPlay = !known || system === "android";
  const showAppStore = !known || system === "ios";
  const showWindows = !known || system === "windows";
  const showMac = !known || system === "mac";

  return (
    <div className="store-badges">
      {showPlay ? (
        <Badge
          href={PLAY_STORE_URL}
          kicker="Get it on"
          title="Google Play"
          mark="▶"
          external
        />
      ) : null}
      {showAppStore ? (
        <Badge
          href={APP_STORE_URL}
          kicker="Download on the"
          title="App Store"
          mark=""
          external
        />
      ) : null}
      {showWindows ? (
        <Badge
          href={DESKTOP_WINDOWS_URL}
          kicker="Download for"
          title="Windows"
          mark="⊞"
          download="Sakora-Setup.exe"
        />
      ) : null}
      {showMac ? (
        <Badge
          href={DESKTOP_MAC_URL}
          kicker="Download for"
          title="Mac"
          mark="⌘"
          download="Sakora.dmg"
        />
      ) : null}
    </div>
  );
}
