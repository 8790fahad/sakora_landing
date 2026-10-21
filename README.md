# Sakora website

Marketing site and customer shops. A shop is `https://sakora.shop/your-shop-name`. Order tracking is `/track`. The merchant app stays in `sakora_ui`.

Search engines and link previews read the title and description from the HTML Hostinger serves. `index.php` fills those in for each page and each shop. `sitemap.php` lists the marketing pages and public shops.

```bash
npm install
npm run dev
```

Open [http://localhost:5174](http://localhost:5174). Sign in and Get started go to the app at `VITE_APP_URL` (default `http://localhost:5173`).
