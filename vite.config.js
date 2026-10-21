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
      },
    },
  ],
  server: {
    port: 5174,
    strictPort: true,
  },
});
