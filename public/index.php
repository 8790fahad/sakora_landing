<?php
require_once __DIR__ . "/seo.php";

if (PHP_SAPI === "cli-server") {
  $static = __DIR__ . parse_url($_SERVER["REQUEST_URI"] ?? "/", PHP_URL_PATH);
  if (is_file($static)) {
    return false;
  }
}

$path = seo_request_path();
if ($path === "/sitemap.xml") {
  require __DIR__ . "/sitemap.php";
  exit;
}

$config = seo_config();
$pages = seo_pages();
$site = $config["siteUrl"];
$image = $site . "/icon-512.png";

$reserved = [
  "shop", "legal", "api", "assets", "login", "register", "app", "admin",
  "downloads", "support", "features", "stories", "pricing", "faq", "newsletter",
  "directory", "sitemap", "robots.txt",
];

function seo_redirect($location) {
  $query = $_SERVER["QUERY_STRING"] ?? "";
  if ($query !== "") {
    $location .= (strpos($location, "?") === false ? "?" : "&") . $query;
  }
  header("Location: " . $location, true, 301);
  header("Cache-Control: public, max-age=86400");
  exit;
}

if ($path === "/legal") {
  seo_redirect("/legal/terms");
}

if (preg_match("#^/shop/([a-z0-9-]+)$#i", $path, $match)) {
  seo_redirect("/" . strtolower($match[1]));
}
if (preg_match("#^/shop/([a-z0-9-]+)/order/([^/]+)$#i", $path, $match)) {
  seo_redirect("/" . strtolower($match[1]) . "/" . rawurlencode($match[2]));
}
if (preg_match("#^/([a-z0-9-]+)/order/([^/]+)$#i", $path, $match)) {
  seo_redirect("/" . strtolower($match[1]) . "/" . rawurlencode($match[2]));
}

$meta = null;

if (isset($pages[$path])) {
  $page = $pages[$path];
  $canonical = $site . ($path === "/" ? "/" : $path);
  $keep = !empty($page["keepJsonLd"]);
  $meta = [
    "title" => $page["title"],
    "description" => $page["description"],
    "canonical" => $canonical,
    "image" => $image,
    "robots" => "index, follow",
    "keepJsonLd" => $keep,
    "jsonLd" => $keep ? null : seo_webpage_json_ld($page["title"], $page["description"], $canonical, $site),
    "cache" => "public, max-age=300",
  ];
} elseif (preg_match("#^/([a-z0-9-]+)$#", $path, $match)) {
  $slug = strtolower($match[1]);
  if (in_array($slug, $reserved, true)) {
    seo_redirect("/");
  }
  $shop = seo_load_shop($config["apiUrl"], $slug);
  if (!$shop || empty($shop["name"])) {
    $meta = [
      "title" => "Shop not found — Sakora",
      "description" => "This shop is offline or does not exist.",
      "canonical" => $site . "/" . $slug,
      "image" => $image,
      "robots" => "noindex, nofollow",
      "jsonLd" => null,
      "cache" => "public, max-age=120",
    ];
  } else {
    $canonical = $site . "/" . rawurlencode($shop["slug"] ?: $slug);
    $description = seo_describe_shop($shop);
    $shopImage = seo_http_image($shop["image"] ?? "") ?: $image;
    $meta = [
      "title" => $shop["name"] . " — Order online",
      "description" => $description,
      "canonical" => $canonical,
      "image" => $shopImage,
      "robots" => "index, follow",
      "jsonLd" => seo_shop_json_ld($shop, $canonical, $description),
      "cache" => "public, max-age=300",
    ];
  }
} elseif (preg_match("#^/([a-z0-9-]+)/([A-Za-z0-9-]+)$#", $path, $match)) {
  $meta = [
    "title" => "Order " . $match[2] . " — Sakora",
    "description" => "Private order status for a Sakora shop.",
    "canonical" => $site . "/" . strtolower($match[1]) . "/" . $match[2],
    "image" => $image,
    "robots" => "noindex, nofollow",
    "jsonLd" => null,
    "cache" => "private, no-store",
  ];
} else {
  $meta = [
    "title" => "Page not found — Sakora",
    "description" => "This Sakora page does not exist.",
    "canonical" => $site . "/",
    "image" => $image,
    "robots" => "noindex, nofollow",
    "jsonLd" => null,
    "cache" => "public, max-age=120",
  ];
}

$htmlFile = __DIR__ . "/index.html";
if (!is_file($htmlFile)) {
  http_response_code(500);
  header("Content-Type: text/plain; charset=UTF-8");
  echo "Sakora is unavailable.";
  exit;
}

header("Content-Type: text/html; charset=UTF-8");
header("Cache-Control: " . $meta["cache"]);
header("X-Robots-Tag: " . $meta["robots"]);

echo seo_render((string) file_get_contents($htmlFile), $meta);
