const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5100/api"
).replace(/\/$/, "");

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || API_URL.replace(/\/api$/, "");

async function request(path, { method = "GET", body } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new Error("Cannot reach Sakora. Check your connection.");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    const details = Array.isArray(payload?.errors)
      ? payload.errors.map((error) => error.message).filter(Boolean).join("\n")
      : "";
    throw new Error(details || payload?.message || "Request failed");
  }
  return payload;
}

const api = {
  storefront: {
    get: (slug) => request(`/storefront/${slug}`),
    checkout: (slug, data) =>
      request(`/storefront/${slug}/checkout`, { method: "POST", body: data }),
    order: (slug, orderNumber) =>
      request(`/storefront/${slug}/orders/${orderNumber}`),
    verify: (slug, orderNumber, data = {}) =>
      request(`/storefront/${slug}/orders/${orderNumber}/verify`, {
        method: "POST",
        body: data,
      }),
    complaint: (slug, orderNumber, data) =>
      request(`/storefront/${slug}/orders/${orderNumber}/complaint`, {
        method: "POST",
        body: data,
      }),
  },
};

export default api;
