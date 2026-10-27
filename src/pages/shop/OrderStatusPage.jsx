import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../storefront/api";
import { openSquadCheckout } from "../../storefront/squadCheckout";
import { orderPageMeta, usePageMeta } from "../../seo";
import PoweredBy from "../../components/PoweredBy";
import "../../storefront.css";

const STATUS_STEPS = [
  "pending",
  "paid",
  "processing",
  "packed",
  "shipped",
  "delivered",
];

const OrderStatusPage = () => {
  const { slug, orderNumber } = useParams();
  const [params] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paying, setPaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showComplaint, setShowComplaint] = useState(false);
  const [complaint, setComplaint] = useState({
    name: "",
    contact: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  usePageMeta(orderPageMeta(slug, orderNumber));

  const load = async () => {
    const response = await api.storefront.order(slug, orderNumber);
    const found = response.data.order;
    setOrder(found);
    setPayment(response.data.payment || null);
    setComplaint({
      name: found.customerName || "",
      contact: found.customerPhone || found.customerEmail || "",
      message: "",
    });
    return found;
  };

  const sendComplaint = async (event) => {
    event.preventDefault();
    if (!order) return;
    if (String(complaint.message || "").trim().length < 5) {
      toast.error("Please describe the issue (at least 5 characters)");
      return;
    }
    setSending(true);
    try {
      await api.storefront.complaint(slug, order.orderNumber, complaint);
      toast.success("Complaint sent. The shop will follow up shortly.");
      setComplaint((c) => ({ ...c, message: "" }));
      setShowComplaint(false);
    } catch (error) {
      toast.error(error.message || "Could not send complaint");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        let current = await load();
        if (
          params.get("mock") === "1" &&
          current.paymentStatus !== "paid"
        ) {
          const verified = await api.storefront.verify(slug, orderNumber, {
            mock: true,
          });
          current = verified.data.order;
          setOrder(current);
        } else if (current.paymentStatus !== "paid") {
          try {
            const verified = await api.storefront.verify(slug, orderNumber, {});
            if (verified.data.order) setOrder(verified.data.order);
          } catch (error) {
            // The invoice can still be opened before Squad confirms it.
          }
        }
      } catch (error) {
        toast.error(error.message || "Could not load order");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [slug, orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Confirming your order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Order not found
      </div>
    );
  }

  const paid = order.paymentStatus === "paid";
  const cancelled =
    order.status === "cancelled" || order.status === "refunded";
  const stepIndex = Math.max(0, STATUS_STEPS.indexOf(order.status));

  let Icon = Clock;
  let title = "Awaiting payment";
  let tone = "text-amber-500";
  if (cancelled) {
    Icon = XCircle;
    title = order.status === "refunded" ? "Order refunded" : "Order cancelled";
    tone = "text-red-500";
  } else if (order.status === "delivered") {
    Icon = CheckCircle2;
    title = "Delivered";
    tone = "text-green-500";
  } else if (order.status === "shipped") {
    Icon = Truck;
    title = "Out for delivery";
    tone = "text-blue-500";
  } else if (paid) {
    Icon = Package;
    title = "Payment confirmed";
    tone = "text-green-500";
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 border">
        <div className="flex items-center gap-3">
          <Icon className={`w-10 h-10 ${tone}`} />
          <div>
            <p className="text-sm text-slate-500">{order.orderNumber}</p>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-slate-500 capitalize">
              Status: {order.status} · Payment: {order.paymentStatus}
            </p>
          </div>
        </div>
        <p className="mt-4 text-slate-600">
          {paid
            ? "We received your payment. Track progress below as the shop prepares and delivers your order."
            : "Complete payment on Squad. This page updates once Squad confirms the transaction."}
        </p>

        {!cancelled && (
          <div className="mt-6 flex justify-between gap-1">
            {STATUS_STEPS.map((step, index) => {
              const active = index <= stepIndex;
              return (
                <div key={step} className="flex-1 text-center">
                  <div
                    className={`mx-auto h-2 rounded-full ${
                      active ? "bg-teal-600" : "bg-slate-200"
                    }`}
                  />
                  <p
                    className={`mt-1 text-[10px] capitalize ${
                      active ? "text-teal-700 font-medium" : "text-slate-400"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 space-y-2">
          {(order.items || []).map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} × {parseFloat(item.quantity)}
              </span>
              <span>₦{parseFloat(item.totalPrice).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t flex justify-between font-semibold">
          <span>Total</span>
          <span>₦{parseFloat(order.total).toLocaleString()}</span>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-3 rounded-xl bg-slate-900 text-white"
          >
            Print
          </button>
          <button
            type="button"
            onClick={() => setShowComplaint((v) => !v)}
            className="flex-1 py-3 rounded-xl border border-amber-400 text-amber-800 bg-white"
          >
            {showComplaint ? "Cancel complaint" : "Report a problem"}
          </button>
          <Link
            to={`/${slug}`}
            className="flex-1 text-center py-3 rounded-xl bg-slate-100"
          >
            Back to shop
          </Link>
          <Link
            to={`/track?shop=${encodeURIComponent(slug)}&order=${encodeURIComponent(
              orderNumber
            )}`}
            className="flex-1 text-center py-3 rounded-xl bg-slate-100"
          >
            Track order
          </Link>
          {!paid && payment?.publicKey && (
            <button
              type="button"
              disabled={paying}
              onClick={async () => {
                setPaying(true);
                try {
                  const result = await openSquadCheckout({
                    publicKey: payment.publicKey,
                    email: payment.email || order.customerEmail,
                    amount: payment.amount || order.total,
                    currency: payment.currency || "NGN",
                    transactionRef: payment.reference,
                    customerName: payment.customerName || order.customerName,
                    callbackUrl: window.location.href.split("?")[0],
                  });
                  if (result?.success) {
                    const verified = await api.storefront.verify(slug, orderNumber, {});
                    if (verified.data.order) setOrder(verified.data.order);
                  }
                } catch (error) {
                  toast.error(error.message || "Could not open Squad");
                } finally {
                  setPaying(false);
                }
              }}
              className="flex-1 py-3 rounded-xl bg-teal-600 text-white"
            >
              {paying ? "Opening Squad..." : "Pay with Squad"}
            </button>
          )}
          {!paid && (
            <button
              onClick={async () => {
                const verified = await api.storefront.verify(slug, orderNumber, {
                  mock: params.get("mock") === "1",
                });
                setOrder(verified.data.order);
              }}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white"
            >
              Refresh payment
            </button>
          )}
        </div>

        {showComplaint ? (
          <form
            onSubmit={sendComplaint}
            className="mt-6 pt-6 border-t space-y-3 no-print"
          >
            <h3 className="font-semibold text-slate-900">Report / complaint</h3>
            <p className="text-sm text-slate-500">
              Tell the shop what went wrong with this order.
            </p>
            <input
              value={complaint.name}
              onChange={(e) =>
                setComplaint((c) => ({ ...c, name: e.target.value }))
              }
              placeholder="Your name"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
            />
            <input
              value={complaint.contact}
              onChange={(e) =>
                setComplaint((c) => ({ ...c, contact: e.target.value }))
              }
              placeholder="Phone or email"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
            />
            <textarea
              rows={4}
              value={complaint.message}
              onChange={(e) =>
                setComplaint((c) => ({ ...c, message: e.target.value }))
              }
              placeholder="Describe the issue..."
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 rounded-xl bg-amber-600 text-white font-medium disabled:opacity-60"
            >
              {sending ? "Sending..." : "Submit complaint"}
            </button>
          </form>
        ) : null}

        <div className="mt-6 no-print">
          <PoweredBy />
        </div>
      </div>
    </div>
  );
};

export default OrderStatusPage;
