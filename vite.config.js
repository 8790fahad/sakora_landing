import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

const pkgVersion =
  JSON.parse(fs.readFileSync(path.resolve(__dirname, "package.json"), "utf8")).version ||
  "0.0.0";

function appVersionPlugin() {
  let appVersion = "";

  const resolveVersion = (command) => {
    if (command === "build") {
      if (!appVersion || appVersion.endsWith("+dev")) {
        appVersion = `${pkgVersion}+${Date.now().toString(36)}`;
      }
      return appVersion;
    }
    if (!appVersion) appVersion = `${pkgVersion}+dev`;
    return appVersion;
  };

  const versionPayload = () =>
    JSON.stringify({ version: appVersion || `${pkgVersion}+dev`, forceUpdate: true });

  return {
    name: "app-version",
    config(_config, { command }) {
      return {
        define: {
          "import.meta.env.VITE_APP_VERSION": JSON.stringify(resolveVersion(command)),
        },
      };
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: `${versionPayload()}\n`,
      });
    },
    transformIndexHtml(html) {
      const version = appVersion || `${pkgVersion}+dev`;
      if (html.includes('name="app-version"')) return html;
      return html.replace(
        "</head>",
        `    <meta name="app-version" content="${version}" />\n  </head>`
      );
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathOnly = String(req.url || "").split("?")[0];
        if (!pathOnly.endsWith("/version.json")) {
          next();
          return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.end(versionPayload());
      });
    },
  };
}

export default defineConfig({
  plugins: [
    appVersionPlugin(),
    react(),
    {
      name: "copy-htaccess",
      closeBundle() {
        const src = path.resolve(__dirname, "public/.htaccess");
        const dest = path.resolve(__dirname, "dist/.htaccess");
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
        const apiUrl = (process.env.VITE_API_URL || "http://localhost:5100/api").replace(
          /\/$/,
          ""
        );
        const siteUrl = (process.env.VITE_SITE_URL || "https://sakora.shop").replace(
          /\/$/,
          ""
        );
        fs.writeFileSync(
          path.resolve(__dirname, "dist/seo-config.json"),
          JSON.stringify({ apiUrl, siteUrl }, null, 2)
        );
      },
    },
  ],
  server: {
    port: 5174,
    strictPort: true,
  },
});
