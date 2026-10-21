import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_URL, STOREFRONT_URL } from "../config";
import { usePageMeta } from "../seo";
import "./track.css";

const STATUS_STEPS = [
  "pending",
  "paid",
  "processing",
  "packed",
  "shipped",
  "delivered",
];

async function fetchOrder(slug, orderNumber) {
  const response = await fetch(
    `${API_URL}/storefront/${encodeURIComponent(slug)}/orders/${encodeURIComponent(
      orderNumber
    )}`
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || "Order not found");
  }
  return payload.data.order;
}

async function submitComplaint(slug, orderNumber, data) {
  const response = await fetch(
    `${API_URL}/storefront/${encodeURIComponent(slug)}/orders/${encodeURIComponent(
      orderNumber
    )}/complaint`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    }
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || "Could not submit complaint");
  }
  return payload;
}

const TrackOrderPage = () => {
  const [params, setParams] = useSearchParams();
  const [shop, setShop] = useState(params.get("shop") || "");
  const [orderNumber, setOrderNumber] = useState(params.get("order") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [showComplaint, setShowComplaint] = useState(false);
  const [complaint, setComplaint] = useState({
    name: "",
    contact: "",
    message: "",
  });
  const [complaintStatus, setComplaintStatus] = useState("");
  const [sending, setSending] = useState(false);

  usePageMeta({
    title: "Track order — Sakora",
    description: "Track a Sakora shop order with your shop name and order number.",
    path: "/track",
  });

  const normalizeShop = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const lookup = async (event) => {
    event?.preventDefault?.();
    const slug = normalizeShop(shop);
    const number = String(orderNumber || "").trim();
    setError("");
    setOrder(null);
    setShowComplaint(false);
    setComplaintStatus("");

    if (!slug) {
      setError("Enter the shop name from your link.");
      return;
    }
    if (!number) {
      setError("Enter your order number.");
      return;
    }

    setLoading(true);
    try {
      const found = await fetchOrder(slug, number);
      setOrder(found);
      setComplaint({
        name: found.customerName || "",
        contact: found.customerPhone || found.customerEmail || "",
        message: "",
      });
      setParams({ shop: slug, order: number }, { replace: true });
    } catch (err) {
      setError(err.message || "Order not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.get("shop") && params.get("order")) {
      lookup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stepIndex = order ? Math.max(0, STATUS_STEPS.indexOf(order.status)) : -1;
  const shopSlug = normalizeShop(shop);

  const sendComplaint = async (event) => {
    event.preventDefault();
    if (!shopSlug || !order) return;
    if (String(complaint.message || "").trim().length < 5) {
      setComplaintStatus("Please describe the issue (at least 5 characters).");
      return;
    }
    setSending(true);
    setComplaintStatus("");
    try {
      await submitComplaint(shopSlug, order.orderNumber, complaint);
      setComplaintStatus("Complaint sent. The shop will follow up shortly.");
      setComplaint((c) => ({ ...c, message: "" }));
      setShowComplaint(false);
    } catch (err) {
      setComplaintStatus(err.message || "Could not send complaint");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="track-page">
      <header className="track-nav">
        <div className="track-wrap track-nav-inner">
          <Link to="/" className="track-brand">
            <img src="/brand.svg" alt="" />
            Sakora
          </Link>
          <Link to="/" className="track-back">
            Back to home
          </Link>
        </div>
      </header>

      <main className="track-wrap track-main">
        <h1>Track your order</h1>
        <p className="track-lead">
          Enter the shop name from your link (
          <span>sakora.shop/your-shop</span>) and your order number.
        </p>

        <form className="track-card" onSubmit={lookup}>
          <label>
            Shop name
            <input
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              placeholder="sakora-demo"
              autoComplete="off"
            />
          </label>
          <label>
            Order number
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="ORDDBEE26090001"
              autoComplete="off"
            />
          </label>
          {error ? <p className="track-error">{error}</p> : null}
          <button type="submit" disabled={loading}>
            {loading ? "Looking up..." : "Track order"}
          </button>
        </form>

        {order ? (
          <section className="track-card track-result" id="order-print-area">
            <p className="track-order-no">{order.orderNumber}</p>
            <h2>
              {order.status === "delivered"
                ? "Delivered"
                : order.status === "shipped"
                ? "Out for delivery"
                : order.paymentStatus === "paid"
                ? "Order in progress"
                : "Awaiting payment"}
            </h2>
            <p className="track-meta">
              Status: <strong>{order.status}</strong> · Payment:{" "}
              <strong>{order.paymentStatus}</strong>
            </p>

            {order.status !== "cancelled" && order.status !== "refunded" ? (
              <div className="track-steps">
                {STATUS_STEPS.map((step, index) => (
                  <div
                    key={step}
                    className={`track-step${
                      index <= stepIndex ? " is-active" : ""
                    }`}
                  >
                    <span />
                    <em>{step}</em>
                  </div>
                ))}
              </div>
            ) : null}

            <ul className="track-items">
              {(order.items || []).map((item) => (
                <li key={item.id}>
                  <span>
                    {item.name} × {parseFloat(item.quantity)}
                  </span>
                  <span>₦{parseFloat(item.totalPrice).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <div className="track-total">
              <span>Total</span>
              <strong>₦{parseFloat(order.total).toLocaleString()}</strong>
            </div>

            <div className="track-actions no-print">
              <button
                type="button"
                className="track-print-btn"
                onClick={() => window.print()}
              >
                Print
              </button>
              <button
                type="button"
                className="track-report-btn"
                onClick={() => setShowComplaint((v) => !v)}
              >
                {showComplaint ? "Cancel complaint" : "Report a problem"}
              </button>
              {shopSlug ? (
                <a
                  className="track-shop-link"
                  href={`${STOREFRONT_URL}/${shopSlug}`}
                >
                  Open shop
                </a>
              ) : null}
            </div>

            {complaintStatus ? (
              <p className="track-complaint-status no-print">{complaintStatus}</p>
            ) : null}

            {showComplaint ? (
              <form className="track-complaint no-print" onSubmit={sendComplaint}>
                <h3>Report / complaint</h3>
                <p>Tell the shop what went wrong with this order.</p>
                <label>
                  Your name
                  <input
                    value={complaint.name}
                    onChange={(e) =>
                      setComplaint((c) => ({ ...c, name: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Phone or email
                  <input
                    value={complaint.contact}
                    onChange={(e) =>
                      setComplaint((c) => ({ ...c, contact: e.target.value }))
                    }
                  />
                </label>
                <label>
                  What happened?
                  <textarea
                    rows={4}
                    value={complaint.message}
                    onChange={(e) =>
                      setComplaint((c) => ({ ...c, message: e.target.value }))
                    }
                    placeholder="Describe the issue..."
                    required
                  />
                </label>
                <button type="submit" disabled={sending}>
                  {sending ? "Sending..." : "Submit complaint"}
                </button>
              </form>
            ) : null}
          </section>
        ) : null}

        <p className="track-powered">
          Powered by{" "}
          <a href="https://nexifour.ng" target="_blank" rel="noreferrer">
            Nexifour Limited
          </a>
        </p>
      </main>
    </div>
  );
};

export default TrackOrderPage;
