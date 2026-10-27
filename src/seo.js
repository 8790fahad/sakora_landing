import { useEffect } from "react";
import { SITE_URL } from "./config";
import pages from "../public/seo-pages.json";

export const SEO_PAGES = pages;

const DEFAULT_IMAGE = `${SITE_URL}/icon-512.png`;

export function absoluteUrl(path = "/") {
  if (!path || path === "/") return `${SITE_URL}/`;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${suffix}`;
}

export function clipText(text, max = 160) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  const trimmed = (space > 80 ? cut.slice(0, space) : cut).trim();
  return `${trimmed}…`;
}

function httpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value) ? value : "";
}

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(jsonLd) {
  if (jsonLd === undefined) return;
  const nodes = [
    ...document.head.querySelectorAll('script[type="application/ld+json"]'),
  ];
  if (jsonLd === null) {
    nodes.forEach((el) => el.remove());
    return;
  }
  const text = JSON.stringify(jsonLd);
  if (nodes[0]) {
    nodes[0].textContent = text;
    nodes.slice(1).forEach((el) => el.remove());
    return;
  }
  const el = document.createElement("script");
  el.type = "application/ld+json";
  el.textContent = text;
  document.head.appendChild(el);
}

export function homeJsonLd() {
  const url = `${SITE_URL}/`;
  const logo = `${SITE_URL}/icon-512.png`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Sakora",
        url,
        description:
          "Manage your shop with Sakora. Track inventory, record daily sales, create invoices, sell on WhatsApp, and run your online store.",
        publisher: {
          "@type": "Organization",
          name: "Sakora",
          url,
          logo,
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Sakora",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, Android, iOS, Windows, macOS",
        url,
        description:
          "Business app for inventory, daily sales, invoices, WhatsApp selling, and an online store. Plans are ₦4,000, ₦12,000, and ₦20,000 a month.",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Can I see profit, not only sales?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Each day shows revenue, cost of sales, gross profit, expenses, and net profit.",
            },
          },
          {
            "@type": "Question",
            name: "Do I need a computer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Sakora is built for your phone. You can also use a tablet or laptop if you want a bigger screen.",
            },
          },
          {
            "@type": "Question",
            name: "How do customers pay?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "They can pay through your shop checkout with Squad, or you can record a cash or transfer sale yourself.",
            },
          },
          {
            "@type": "Question",
            name: "Can I sell on WhatsApp?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Share a product, invoice, or your full shop link. Customers message you or pay online.",
            },
          },
          {
            "@type": "Question",
            name: "How much does Sakora cost?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Starter is ₦4,000 a month, Growth is ₦12,000, and Business is ₦20,000. You pay with Squad from Billing.",
            },
          },
        ],
      },
    ],
  };
}

function webPageNode(title, description, path) {
  return {
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: "Sakora",
      url: `${SITE_URL}/`,
    },
  };
}

function breadcrumbLabel(path, title) {
  if (path.startsWith("/legal/")) return title.replace(/ — Sakora$/, "");
  if (path === "/track") return "Track your order";
  return title.replace(/ — Sakora$/, "");
}

function pageJsonLd(title, description, path) {
  const page = webPageNode(title, description, path);
  const nested = path.startsWith("/legal/") || path === "/track";
  if (!nested) {
    return { "@context": "https://schema.org", ...page };
  }
  return {
    "@context": "https://schema.org",
    "@graph": [
      page,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Sakora",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: breadcrumbLabel(path, title),
            item: absoluteUrl(path),
          },
        ],
      },
    ],
  };
}

export function staticPageMeta(path) {
  const page = SEO_PAGES[path];
  if (!page) {
    return {
      title: "Page not found — Sakora",
      description: "This Sakora page does not exist.",
      path: "/",
      robots: "noindex, nofollow",
      jsonLd: null,
    };
  }
  return {
    title: page.title,
    description: page.description,
    path,
    robots: "index, follow",
    jsonLd:
      path === "/"
        ? homeJsonLd()
        : pageJsonLd(page.title, page.description, path),
  };
}

export function describeShop(store, productNames) {
  const city = String(store?.city || "").trim();
  const where = city ? ` in ${city}` : "";
  let lead = String(store?.description || "").trim();
  if (!lead) {
    lead = String(store?.tagline || store?.settings?.tagline || "").trim();
  }
  if (!lead) lead = `Order from ${store?.name || "this shop"}${where}.`;
  const names = (productNames || [])
    .map((name) => String(name || "").trim())
    .filter(Boolean)
    .slice(0, 6);
  const list = names.length ? ` Products include ${names.join(", ")}.` : "";
  return clipText(`${lead}${list} Pay on Sakora or WhatsApp.`);
}

export function shopPageMeta({ slug, store, products, status }) {
  const path = `/${String(slug || "").toLowerCase()}`;
  if (status === "loading") return null;
  if (status !== "ready" || !store) {
    const missing = status === "missing";
    return {
      title: missing ? "Shop not found — Sakora" : "Online shop — Sakora",
      description: missing
        ? "This shop is offline or does not exist."
        : "Browse products and order from a Sakora shop.",
      path,
      robots: missing ? "noindex, nofollow" : "index, follow",
      ...(missing ? { jsonLd: null } : {}),
    };
  }

  const names = (products || []).map((product) => product.name);
  const description = describeShop(store, names);
  const image =
    httpUrl(store.logo) ||
    httpUrl((products || []).find((product) => httpUrl(product.image))?.image);
  const url = absoluteUrl(path);
  const offers = (products || [])
    .filter((product) => product?.name)
    .slice(0, 8)
    .map((product) => ({
      "@type": "Offer",
      name: product.name,
      price: String(parseFloat(product.sellingPrice || 0) || 0),
      priceCurrency: store.currency || "NGN",
      availability:
        product.stock === 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      url,
    }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: store.name,
    url,
    description,
  };
  if (image) jsonLd.image = image;
  if (store.city) {
    jsonLd.address = {
      "@type": "PostalAddress",
      addressLocality: store.city,
      addressCountry: "NG",
    };
  }
  if (offers.length) {
    jsonLd.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: `${store.name} products`,
      itemListElement: offers,
    };
  }

  return {
    title: `${store.name} — Order online`,
    description,
    path,
    image,
    robots: "index, follow",
    jsonLd,
  };
}

export function orderPageMeta(slug, orderNumber) {
  return {
    title: `Order ${orderNumber} — Sakora`,
    description: "Private order status for a Sakora shop.",
    path: `/${slug}/${orderNumber}`,
    robots: "noindex, nofollow",
    jsonLd: null,
  };
}

export function usePageMeta(meta) {
  const title = meta?.title || "";
  const description = meta?.description || "";
  const path = meta?.path || "/";
  const image = meta?.image;
  const robots = meta?.robots || "index, follow";
  const type = meta?.type || "website";
  const jsonLd = meta?.jsonLd;
  const jsonKey =
    jsonLd === undefined ? undefined : jsonLd === null ? null : JSON.stringify(jsonLd);

  useEffect(() => {
    if (!title) return;
    const url = absoluteUrl(path);
    const img = httpUrl(image) || DEFAULT_IMAGE;
    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", robots);
    upsertMeta("property", "og:site_name", "Sakora");
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:locale", "en_NG");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", img);
    upsertMeta("property", "og:image:alt", title);
    upsertMeta("name", "twitter:card", "summary");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", img);
    upsertLink("canonical", url);
    setJsonLd(jsonLd);
  }, [title, description, path, image, robots, type, jsonKey]);
}
