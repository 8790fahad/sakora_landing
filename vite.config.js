import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [
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
