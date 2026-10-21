# Sakora website (`sakora_landing`)

Marketing site, customer shops, and order tracking for [sakora.shop](https://sakora.shop).

| Path | Page |
|------|------|
| `/` | Landing |
| `/legal/:slug` | Terms / privacy |
| `/track` | Order lookup |
| `/:shop` | Customer shop |
| `/:shop/:orderNumber` | Order status + payment verify |

Merchant app: [app.sakora.shop](https://app.sakora.shop)

## Local

```bash
npm install
npm run dev   # http://localhost:5174
```

Copy `.env.example` to `.env` as needed. Shops call the API at `VITE_API_URL`.

## Deploy

Push to `main` runs `.github/workflows/deploy.yml` (FTPS → Hostinger `sakora.shop`).

Required secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.
