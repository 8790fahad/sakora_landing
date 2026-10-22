const PRESETS = {
  thumb: "c_fill,g_auto,w_160,h_160,f_auto,q_auto",
  card: "c_fill,g_auto,w_800,h_320,f_auto,q_auto",
  preview: "c_limit,w_1200,f_auto,q_auto",
};

const TRANSFORM_SEGMENT = /^(?:[a-z]{1,3}_[^/]+\/)+/i;

export const productImageSrc = (url, preset = "card") => {
  const value = String(url || "").trim();
  const transform = PRESETS[preset] || PRESETS.card;
  const match = value.match(
    /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/i
  );
  if (!match) return value;
  const rest = match[2].replace(TRANSFORM_SEGMENT, "");
  return `${match[1]}${transform}/${rest}`;
};
