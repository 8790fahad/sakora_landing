import {
  APP_STORE_URL,
  DESKTOP_MAC_URL,
  DESKTOP_WINDOWS_URL,
  PLAY_STORE_URL,
} from "../config";

function Badge({ href, kicker, title, icon, external, download }) {
  return (
    <a
      className="store-badge"
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      {...(download ? { download } : {})}
    >
      <span className="badge-mark" aria-hidden="true">
        {icon}
      </span>
      <span>
        <small>{kicker}</small>
        <strong>{title}</strong>
      </span>
    </a>
  );
}

function MacIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M4 5.2A1.7 1.7 0 0 1 5.7 3.5h12.6A1.7 1.7 0 0 1 20 5.2V15H4V5.2Zm-1.6 11.1A1.2 1.2 0 0 0 3.5 18.4h17a1.2 1.2 0 0 0 1.1-2.1l-1.3-.7H3.7l-1.3.7Z"
      />
    </svg>
  );
}

function WindowsIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M3 5.1 10.4 4v7.3H3V5.1Zm8.2-.1L21 3.4v7.9h-9.8V5Zm-8.2 7.6h7.4V20L3 18.7v-6.1Zm8.2 0H21V20.6l-9.8-1.5v-6.5Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M16.2 12.6c0-2.2 1.8-3.3 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.2-2.7.8-3.4.8-.7 0-1.8-.8-2.9-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.8 2.2 1.1 0 1.6-.7 2.9-.7s1.7.7 2.9.7 2-.1 2.8-2.2c.6-.9.9-1.8.9-1.9-.1 0-1.8-.7-1.8-2.8ZM14.6 6.4c.6-.7 1-1.8.9-2.9-.9.1-1.9.6-2.5 1.3-.6.7-1.1 1.7-.9 2.8 1 .1 1.9-.5 2.5-1.2Z"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M3 20.5v-17C3 2.9 3.3 2.4 3.8 2.2L13.7 12 3.8 21.8c-.5-.2-.8-.7-.8-1.3Z"
      />
      <path fill="#34A853" d="M16.8 15.1 6 21.3l8.5-8.5 2.3 2.3Z" />
      <path
        fill="#FBBC04"
        d="M20.2 10.8c.4.3.6.7.6 1.2s-.2.9-.6 1.2l-2.3 1.3-2.5-2.5 2.5-2.5 2.3 1.3Z"
      />
      <path fill="#EA4335" d="M6 2.7 16.8 8.9 14.5 11.2 6 2.7Z" />
    </svg>
  );
}

export default function GetTheApp() {
  return (
    <div className="store-badges">
      <Badge
        href={DESKTOP_MAC_URL}
        kicker="Download for"
        title="Mac"
        icon={<MacIcon />}
        download="Sakora.dmg"
      />
      <Badge
        href={DESKTOP_WINDOWS_URL}
        kicker="Download for"
        title="Windows"
        icon={<WindowsIcon />}
        download="Sakora-Setup.exe"
      />
      <Badge
        href={APP_STORE_URL}
        kicker="Download on the"
        title="App Store"
        icon={<AppleIcon />}
        external
      />
      <Badge
        href={PLAY_STORE_URL}
        kicker="Get it on"
        title="Google Play"
        icon={<PlayIcon />}
        external
      />
    </div>
  );
}
