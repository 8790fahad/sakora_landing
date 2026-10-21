import {
  APP_STORE_URL,
  DESKTOP_MAC_URL,
  DESKTOP_WINDOWS_URL,
  PLAY_STORE_URL,
  appPath,
} from "../config";

function Badge({ href, kicker, title, mark, external, download }) {
  return (
    <a
      className="store-badge"
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      {...(download ? { download: true } : {})}
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
  const windowsHref = DESKTOP_WINDOWS_URL || appPath("/");
  const macHref = DESKTOP_MAC_URL || appPath("/");

  return (
    <div className="store-badges">
      <Badge
        href={PLAY_STORE_URL}
        kicker="Get it on"
        title="Google Play"
        mark="▶"
        external
      />
      <Badge
        href={APP_STORE_URL}
        kicker="Download on the"
        title="App Store"
        mark=""
        external
      />
      <Badge
        href={windowsHref}
        kicker={DESKTOP_WINDOWS_URL ? "Download for" : "Open on"}
        title="Windows"
        mark="⊞"
        download={Boolean(DESKTOP_WINDOWS_URL)}
      />
      <Badge
        href={macHref}
        kicker={DESKTOP_MAC_URL ? "Download for" : "Open on"}
        title="Mac"
        mark="⌘"
        download={Boolean(DESKTOP_MAC_URL)}
      />
    </div>
  );
}
