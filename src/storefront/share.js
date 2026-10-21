export const toWhatsAppNumber = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
};

export const whatsappLink = (phone, text) => {
  const number = toWhatsAppNumber(phone);
  const encoded = encodeURIComponent(text);
  return number
    ? `https://wa.me/${number}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
};

export const shareProductText = (storeName, product, url) =>
  `${product.name} — ₦${parseFloat(product.sellingPrice || 0).toLocaleString()}\n${
    product.description ? `${product.description}\n` : ""
  }Order here: ${url}`;

export const asSettings = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
};
