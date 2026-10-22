import {
  APP_STORE_URL,
  DESKTOP_MAC_URL,
  DESKTOP_WINDOWS_URL,
  PLAY_STORE_URL,
} from "../config";

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
        href={DESKTOP_WINDOWS_URL}
        kicker="Download for"
        title="Windows"
        mark="⊞"
        download="Sakora-Setup.exe"
      />
      <Badge
        href={DESKTOP_MAC_URL}
        kicker="Download for"
        title="Mac"
        mark="⌘"
        download="Sakora.dmg"
      />
    </div>
  );
}
