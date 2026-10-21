/** Merchant dashboard — local UI or https://app.sakora.shop */
export const APP_URL = (
  import.meta.env.VITE_APP_URL || "http://localhost:5173"
).replace(/\/$/, "");

export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5100/api"
).replace(/\/$/, "");

export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://sakora.shop"
).replace(/\/$/, "");

/** Customer shops: https://sakora.shop/{businessSlug} */
export const STOREFRONT_URL = (
  import.meta.env.VITE_STOREFRONT_URL || SITE_URL
).replace(/\/$/, "");

export const PLAY_STORE_URL =
  import.meta.env.VITE_PLAY_STORE_URL ||
  "https://play.google.com/store/search?q=Sakora&c=apps";

export const APP_STORE_URL =
  import.meta.env.VITE_APP_STORE_URL ||
  "https://apps.apple.com/search?term=Sakora";

export const DESKTOP_WINDOWS_URL = import.meta.env.VITE_DESKTOP_WINDOWS_URL || "";
export const DESKTOP_MAC_URL = import.meta.env.VITE_DESKTOP_MAC_URL || "";

export function appPath(path) {
  return `${APP_URL}${path}`;
}
