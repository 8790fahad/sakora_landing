<?php
/**
 * Shared SEO helpers for the Hostinger site.
 * index.php injects these tags into index.html so crawlers and WhatsApp
 * see the right title before JavaScript runs.
 */

function seo_config() {
  $config = [
    "apiUrl" => "https://nexifour.ng/sakora/api",
    "siteUrl" => "https://sakora.shop",
  ];
  $file = __DIR__ . "/seo-config.json";
  if (is_file($file)) {
    $parsed = json_decode((string) file_get_contents($file), true);
    if (is_array($parsed)) {
      if (!empty($parsed["apiUrl"])) {
        $config["apiUrl"] = rtrim((string) $parsed["apiUrl"], "/");
      }
      if (!empty($parsed["siteUrl"])) {
        $config["siteUrl"] = rtrim((string) $parsed["siteUrl"], "/");
      }
    }
  }
  return $config;
}

function seo_pages() {
  $file = __DIR__ . "/seo-pages.json";
  if (!is_file($file)) {
    return [];
  }
  $parsed = json_decode((string) file_get_contents($file), true);
  return is_array($parsed) ? $parsed : [];
}

function seo_esc($value) {
  return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, "UTF-8");
}

function seo_clip($text, $max = 160) {
  $clean = trim(preg_replace("/\s+/u", " ", (string) $text));
  $length = function_exists("mb_strlen") ? mb_strlen($clean) : strlen($clean);
  if ($length <= $max) {
    return $clean;
  }
  $cut = function_exists("mb_substr") ? mb_substr($clean, 0, $max - 1) : substr($clean, 0, $max - 1);
  $space = function_exists("mb_strrpos") ? mb_strrpos($cut, " ") : strrpos($cut, " ");
  if ($space !== false && $space > 80) {
    $cut = function_exists("mb_substr") ? mb_substr($cut, 0, $space) : substr($cut, 0, $space);
  }
  return rtrim($cut) . "…";
}

function seo_request_path() {
  $uri = parse_url($_SERVER["REQUEST_URI"] ?? "/", PHP_URL_PATH);
  $uri = rawurldecode($uri ?: "/");
  $uri = preg_replace("#/+#", "/", $uri);
  if ($uri === "") {
    $uri = "/";
  }
  if ($uri !== "/") {
    $uri = rtrim($uri, "/");
  }
  return $uri === "" ? "/" : $uri;
}

function seo_cache_file($key) {
  return sys_get_temp_dir() . "/sakora-seo-" . hash("sha256", $key);
}

function seo_cache_get($key) {
  $file = seo_cache_file($key);
  if (!is_file($file)) {
    return null;
  }
  $parsed = json_decode((string) file_get_contents($file), true);
  if (!is_array($parsed) || empty($parsed["until"]) || $parsed["until"] < time()) {
    return null;
  }
  return $parsed["value"] ?? null;
}

function seo_cache_set($key, $value, $ttl) {
  $file = seo_cache_file($key);
  @file_put_contents($file, json_encode([
    "until" => time() + (int) $ttl,
    "value" => $value,
  ]));
}

function seo_http_json($url) {
  $body = false;
  $code = 0;
  if (function_exists("curl_init")) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_TIMEOUT => 4,
      CURLOPT_CONNECTTIMEOUT => 2,
      CURLOPT_HTTPHEADER => ["Accept: application/json"],
      CURLOPT_USERAGENT => "SakoraSEO/1.0",
    ]);
    $body = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
  } else {
    $context = stream_context_create([
      "http" => [
        "timeout" => 4,
        "header" => "Accept: application/json\r\nUser-Agent: SakoraSEO/1.0\r\n",
        "ignore_errors" => true,
      ],
    ]);
    $body = @file_get_contents($url, false, $context);
    $code = $body === false ? 0 : 200;
  }
  if ($body === false || $code >= 400) {
    return null;
  }
  $parsed = json_decode((string) $body, true);
  return is_array($parsed) ? $parsed : null;
}

function seo_http_image($value) {
  return is_string($value) && preg_match("#^https?://#i", $value) ? $value : "";
}

function seo_describe_shop($shop) {
  $name = trim((string) ($shop["name"] ?? "this shop"));
  $city = trim((string) ($shop["city"] ?? ""));
  $lead = trim((string) ($shop["description"] ?? ""));
  if ($lead === "") {
    $lead = trim((string) ($shop["tagline"] ?? ""));
  }
  if ($lead === "") {
    $lead = "Order from " . $name . ($city !== "" ? " in " . $city : "") . ".";
  }
  $names = [];
  foreach ($shop["products"] ?? [] as $product) {
    $label = trim((string) (is_array($product) ? ($product["name"] ?? "") : $product));
    if ($label !== "") {
      $names[] = $label;
    }
    if (count($names) >= 6) {
      break;
    }
  }
  $list = $names ? " Products include " . implode(", ", $names) . "." : "";
  return seo_clip($lead . $list . " Pay on Sakora or WhatsApp.");
}

function seo_shop_from_payload($payload) {
  if (!is_array($payload)) {
    return null;
  }
  if (!empty($payload["data"]["name"]) && isset($payload["data"]["slug"])) {
    return $payload["data"];
  }
  $store = $payload["data"]["store"] ?? null;
  if (!is_array($store) || empty($store["name"])) {
    return null;
  }
  $products = [];
  $image = seo_http_image($store["logo"] ?? "");
  foreach ($payload["data"]["products"] ?? [] as $product) {
    if (!empty($product["name"])) {
      $products[] = [
        "name" => (string) $product["name"],
        "price" => isset($product["sellingPrice"]) ? (string) $product["sellingPrice"] : "",
      ];
    }
    if ($image === "") {
      $image = seo_http_image($product["image"] ?? "");
    }
    if (count($products) >= 8 && $image !== "") {
      break;
    }
  }
  $settings = is_array($store["settings"] ?? null) ? $store["settings"] : [];
  return [
    "name" => $store["name"],
    "slug" => $store["slug"] ?? "",
    "description" => $store["description"] ?? "",
    "tagline" => $settings["tagline"] ?? "",
    "city" => $store["city"] ?? "",
    "state" => "",
    "country" => "Nigeria",
    "currency" => $store["currency"] ?? "NGN",
    "image" => $image,
    "products" => array_slice($products, 0, 8),
  ];
}

function seo_load_shop($apiUrl, $slug) {
  $cached = seo_cache_get("shop:" . $slug);
  if (is_array($cached) && array_key_exists("shop", $cached)) {
    return $cached["shop"];
  }

  $shop = seo_shop_from_payload(
    seo_http_json($apiUrl . "/storefront/" . rawurlencode($slug) . "/meta")
  );
  if (!$shop) {
    $shop = seo_shop_from_payload(
      seo_http_json($apiUrl . "/storefront/" . rawurlencode($slug))
    );
  }
  seo_cache_set("shop:" . $slug, ["shop" => $shop], $shop ? 600 : 120);
  return $shop;
}

function seo_shop_json_ld($shop, $canonical, $description) {
  $data = [
    "@context" => "https://schema.org",
    "@type" => "OnlineStore",
    "name" => $shop["name"],
    "url" => $canonical,
    "description" => $description,
  ];
  $image = seo_http_image($shop["image"] ?? "");
  if ($image !== "") {
    $data["image"] = $image;
  }
  $city = trim((string) ($shop["city"] ?? ""));
  if ($city !== "") {
    $address = [
      "@type" => "PostalAddress",
      "addressLocality" => $city,
      "addressCountry" => "NG",
    ];
    $state = trim((string) ($shop["state"] ?? ""));
    if ($state !== "") {
      $address["addressRegion"] = $state;
    }
    $data["address"] = $address;
  }
  $offers = [];
  $currency = $shop["currency"] ?? "NGN";
  foreach (array_slice($shop["products"] ?? [], 0, 8) as $product) {
    $label = trim((string) (is_array($product) ? ($product["name"] ?? "") : $product));
    if ($label === "") {
      continue;
    }
    $offer = [
      "@type" => "Offer",
      "name" => $label,
      "url" => $canonical,
      "priceCurrency" => $currency,
    ];
    $price = is_array($product) ? trim((string) ($product["price"] ?? "")) : "";
    if ($price !== "" && is_numeric($price)) {
      $offer["price"] = $price;
    }
    $offers[] = $offer;
  }
  if ($offers) {
    $data["hasOfferCatalog"] = [
      "@type" => "OfferCatalog",
      "name" => $shop["name"] . " products",
      "itemListElement" => $offers,
    ];
  }
  return $data;
}

function seo_webpage_json_ld($title, $description, $canonical, $siteUrl) {
  return [
    "@context" => "https://schema.org",
    "@type" => "WebPage",
    "name" => $title,
    "description" => $description,
    "url" => $canonical,
    "isPartOf" => [
      "@type" => "WebSite",
      "name" => "Sakora",
      "url" => $siteUrl . "/",
    ],
  ];
}

function seo_replace_meta($html, $attr, $key, $content) {
  $pattern = '/<meta\b[^>]*\b' . preg_quote($attr, "/") . '="' . preg_quote($key, "/") . '"[^>]*>/i';
  $tag = '<meta ' . $attr . '="' . $key . '" content="' . seo_esc($content) . '" />';
  if (preg_match($pattern, $html)) {
    return preg_replace($pattern, $tag, $html, 1);
  }
  return str_replace("</head>", "    " . $tag . "\n  </head>", $html);
}

function seo_render($html, $meta) {
  $title = $meta["title"];
  $description = $meta["description"];
  $canonical = $meta["canonical"];
  $image = $meta["image"];
  $robots = $meta["robots"];
  $type = $meta["type"] ?? "website";

  $html = preg_replace("/<title>.*?<\/title>/s", "<title>" . seo_esc($title) . "</title>", $html, 1);
  $html = seo_replace_meta($html, "name", "description", $description);
  $html = seo_replace_meta($html, "name", "robots", $robots);
  $html = seo_replace_meta($html, "property", "og:title", $title);
  $html = seo_replace_meta($html, "property", "og:description", $description);
  $html = seo_replace_meta($html, "property", "og:url", $canonical);
  $html = seo_replace_meta($html, "property", "og:image", $image);
  $html = seo_replace_meta($html, "property", "og:image:alt", $title);
  $html = seo_replace_meta($html, "property", "og:type", $type);
  $html = seo_replace_meta($html, "name", "twitter:title", $title);
  $html = seo_replace_meta($html, "name", "twitter:description", $description);
  $html = seo_replace_meta($html, "name", "twitter:image", $image);
  $html = seo_replace_meta($html, "name", "twitter:card", "summary");

  $canonicalTag = '<link rel="canonical" href="' . seo_esc($canonical) . '" />';
  if (preg_match('/<link\b[^>]*\brel="canonical"[^>]*>/i', $html)) {
    $html = preg_replace('/<link\b[^>]*\brel="canonical"[^>]*>/i', $canonicalTag, $html, 1);
  } else {
    $html = str_replace("</head>", "    " . $canonicalTag . "\n  </head>", $html);
  }

  if (empty($meta["keepJsonLd"]) && array_key_exists("jsonLd", $meta)) {
    $flags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS;
    $json = $meta["jsonLd"] === null
      ? ""
      : json_encode($meta["jsonLd"], $flags);
    $script = $json === "" ? "" : '<script type="application/ld+json">' . $json . "</script>";
    if (preg_match('/<script type="application\/ld\+json">.*?<\/script>/s', $html)) {
      $html = preg_replace(
        '/<script type="application\/ld\+json">.*?<\/script>/s',
        $script,
        $html,
        1
      );
    } elseif ($script !== "") {
      $html = str_replace("</head>", "    " . $script . "\n  </head>", $html);
    }
  }

  return $html;
}
