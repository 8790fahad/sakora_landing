import { Navigate, Route, Routes, useParams } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LegalPage from "./pages/LegalPage";
import NotFoundPage from "./pages/NotFoundPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import StorePage from "./pages/shop/StorePage";
import OrderStatusPage from "./pages/shop/OrderStatusPage";

const RESERVED_SLUGS = new Set([
  "track",
  "shop",
  "legal",
  "api",
  "assets",
  "login",
  "register",
  "app",
  "admin",
  "downloads",
  "support",
  "features",
  "stories",
  "pricing",
  "faq",
  "newsletter",
  "directory",
  "sitemap",
]);

function ShopRedirect() {
  const { slug, orderNumber } = useParams();
  if (orderNumber) {
    return <Navigate to={`/${slug}/${orderNumber}`} replace />;
  }
  return <Navigate to={`/${slug}`} replace />;
}

function LegacyOrderRedirect() {
  const { slug, orderNumber } = useParams();
  return <Navigate to={`/${slug}/${orderNumber}`} replace />;
}

function StoreRoute() {
  const { slug } = useParams();
  if (RESERVED_SLUGS.has(String(slug || "").toLowerCase())) {
    return <Navigate to="/" replace />;
  }
  return <StorePage />;
}

function OrderRoute() {
  const { slug } = useParams();
  if (RESERVED_SLUGS.has(String(slug || "").toLowerCase())) {
    return <Navigate to="/" replace />;
  }
  return <OrderStatusPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/track" element={<TrackOrderPage />} />
      <Route path="/legal/:slug" element={<LegalPage />} />

      {/* Legacy /shop/... and /:slug/order/... → flat /:slug/:orderNumber */}
      <Route path="/shop/:slug" element={<ShopRedirect />} />
      <Route path="/shop/:slug/order/:orderNumber" element={<ShopRedirect />} />
      <Route
        path="/:slug/order/:orderNumber"
        element={<LegacyOrderRedirect />}
      />

      <Route path="/:slug/:orderNumber" element={<OrderRoute />} />
      <Route path="/:slug" element={<StoreRoute />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
