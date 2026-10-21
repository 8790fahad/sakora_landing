export function printOrderReport(order, shopName = "Shop") {
  if (!order) return;

  const items = (order.items || [])
    .map(
      (item) => `<tr>
        <td>${escapeHtml(item.name)}</td>
        <td style="text-align:center">${Number(item.quantity || 0)}</td>
        <td style="text-align:right">₦${Number(item.totalPrice || 0).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Order ${escapeHtml(order.orderNumber)}</title>
  <style>
    body { font-family: "Segoe UI", Arial, sans-serif; color: #0f172a; padding: 24px; }
    h1 { margin: 0 0 4px; font-size: 22px; }
    .muted { color: #64748b; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 18px; }
    th, td { padding: 8px 6px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: left; }
    th { background: #0f172a; color: #fff; }
    .total { margin-top: 14px; font-weight: 700; display: flex; justify-content: space-between; }
    .powered { margin-top: 28px; text-align: center; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <h1>Order report</h1>
  <p class="muted">${escapeHtml(shopName)}</p>
  <p><strong>${escapeHtml(order.orderNumber)}</strong></p>
  <p class="muted">Status: ${escapeHtml(order.status)} · Payment: ${escapeHtml(
    order.paymentStatus
  )}</p>
  ${
    order.customerName
      ? `<p class="muted">Customer: ${escapeHtml(order.customerName)}</p>`
      : ""
  }
  <table>
    <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${items}</tbody>
  </table>
  <div class="total">
    <span>Total</span>
    <span>₦${Number(order.total || 0).toLocaleString()}</span>
  </div>
  <p class="powered">Powered by Nexifour Limited</p>
</body>
</html>`;

  const frame = document.createElement("iframe");
  frame.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0";
  document.body.appendChild(frame);
  const doc = frame.contentDocument || frame.contentWindow?.document;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => {
    try {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    } catch {
      /* ignore */
    }
    setTimeout(() => frame.remove(), 1000);
  }, 250);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
