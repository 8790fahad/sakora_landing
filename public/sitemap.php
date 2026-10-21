<?php
require_once __DIR__ . "/seo.php";

$config = seo_config();
$site = $config["siteUrl"];
$cached = seo_cache_get("sitemap:" . $site);
if (is_string($cached) && $cached !== "") {
  header("Content-Type: application/xml; charset=UTF-8");
  header("Cache-Control: public, max-age=1800");
  echo $cached;
  exit;
}

$static = [
  ["loc" => $site . "/", "priority" => "1.0"],
  ["loc" => $site . "/track", "priority" => "0.6"],
  ["loc" => $site . "/legal/terms", "priority" => "0.3"],
  ["loc" => $site . "/legal/merchant-terms", "priority" => "0.3"],
  ["loc" => $site . "/legal/privacy", "priority" => "0.3"],
];

$shops = [];
$directory = seo_http_json($config["apiUrl"] . "/storefront/directory");
$listed = [];
if (is_array($directory) && is_array($directory["data"]["shops"] ?? null)) {
  $listed = $directory["data"]["shops"];
}
foreach ($listed as $shop) {
  $slug = strtolower(trim((string) ($shop["slug"] ?? "")));
  if ($slug === "" || !preg_match("#^[a-z0-9-]+$#", $slug)) {
    continue;
  }
  $lastmod = "";
  if (!empty($shop["updatedAt"])) {
    $time = strtotime((string) $shop["updatedAt"]);
    if ($time) {
      $lastmod = gmdate("Y-m-d", $time);
    }
  }
  $shops[] = [
    "loc" => $site . "/" . rawurlencode($slug),
    "priority" => "0.8",
    "lastmod" => $lastmod,
  ];
}

$xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
$xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach (array_merge($static, $shops) as $url) {
  $xml .= "  <url>\n";
  $xml .= "    <loc>" . seo_esc($url["loc"]) . "</loc>\n";
  if (!empty($url["lastmod"])) {
    $xml .= "    <lastmod>" . seo_esc($url["lastmod"]) . "</lastmod>\n";
  }
  $xml .= "    <priority>" . seo_esc($url["priority"]) . "</priority>\n";
  $xml .= "  </url>\n";
}
$xml .= "</urlset>\n";

seo_cache_set("sitemap:" . $site, $xml, 1800);
header("Content-Type: application/xml; charset=UTF-8");
header("Cache-Control: public, max-age=1800");
echo $xml;
