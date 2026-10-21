import { Link, Navigate, useParams } from "react-router-dom";
import { appPath } from "../config";
import { usePageMeta } from "../seo";
import "./legal.css";

const documents = {
  terms: {
    title: "General Terms of Use",
    updated: "22 September 2026",
    sections: [
      {
        heading: "1. The service",
        body: "Sakora is a business app for inventory, sales, invoices, a shareable online shop, WhatsApp selling, and payments. By creating an account, you agree to these General Terms of Use.",
      },
      {
        heading: "2. Your account",
        body: "You must provide accurate details and keep your login details safe. You are responsible for activity on your account, including actions by staff you invite.",
      },
      {
        heading: "3. Acceptable use",
        body: "Do not use Sakora for fraud, illegal goods, abuse of payment tools, or to impersonate another business. We may suspend accounts that break these terms.",
      },
      {
        heading: "4. Content and shop",
        body: "You own your product, customer, and business data. You grant Sakora a licence to host and display that data so the app, shop, invoices, and messages can work.",
      },
      {
        heading: "5. Payments",
        body: "Card, transfer, and USSD checkout is processed by Squad. Squad’s rules apply to those payments. Sakora does not store full card numbers.",
      },
      {
        heading: "6. Changes",
        body: "We may update these terms. Continued use after an update means you accept the new terms. If you do not agree, stop using the service and close your account.",
      },
    ],
  },
  "merchant-terms": {
    title: "Merchant Terms of Use",
    updated: "22 September 2026",
    sections: [
      {
        heading: "1. Merchant role",
        body: "If you sell through Sakora, you are the merchant. You set prices, stock, delivery, refunds, and customer support. Customers contract with you, not with Sakora, for the goods or services they buy.",
      },
      {
        heading: "2. Shop and invoices",
        body: "Your shop link, WhatsApp shares, and invoices must describe products honestly. You must fulfil paid orders or refund the customer.",
      },
      {
        heading: "3. WhatsApp and messages",
        body: "You are responsible for messages you send to customers. Only contact people who expect to hear from your business, and follow WhatsApp and local messaging rules.",
      },
      {
        heading: "4. Settlement",
        body: "Payouts for Squad checkouts follow your Squad merchant account. Fees, chargebacks, and settlement timing are between you and Squad.",
      },
      {
        heading: "5. Prohibited goods",
        body: "You may not list illegal items, stolen goods, or anything payment partners disallow. We can take a shop offline if it puts other merchants or customers at risk.",
      },
    ],
  },
  privacy: {
    title: "General Privacy Policy",
    updated: "22 September 2026",
    sections: [
      {
        heading: "1. Data we collect",
        body: "We collect the name, email, phone, and business details you submit, plus products, sales, orders, invoices, and device/session data needed to run the app.",
      },
      {
        heading: "2. How we use it",
        body: "We use this data to create your account, run your shop, send order and invoice messages, process payments with Squad, and improve the product.",
      },
      {
        heading: "3. Marketing",
        body: "If you tick the marketing box at signup, we may send business tips and product updates by email or SMS. You can opt out at any time by asking support or turning the preference off.",
      },
      {
        heading: "4. Sharing",
        body: "We share data with providers that help us operate Sakora, including hosting, email, SMS, and Squad for payments. We do not sell your customer list.",
      },
      {
        heading: "5. Retention and rights",
        body: "We keep account data while your business is active and as required by law. You can request a copy or deletion of your personal data, subject to records we must keep for tax or disputes.",
      },
    ],
  },
};

export default function LegalPage() {
  const { slug } = useParams();
  const doc = documents[slug];

  usePageMeta({
    title: doc ? `${doc.title} — Sakora` : "Sakora",
    description: doc
      ? doc.sections[0].body
      : "Terms and privacy information for Sakora.",
    path: `/legal/${doc ? slug : "terms"}`,
  });

  if (!doc) {
    return <Navigate to="/legal/terms" replace />;
  }

  return (
    <div className="legal">
      <header>
        <div className="wrap">
          <a href="/">← Sakora</a>
          <h1>{doc.title}</h1>
          <p>Last updated {doc.updated}</p>
        </div>
      </header>
      <main className="wrap">
        <nav>
          <Link to="/legal/terms">General Terms of Use</Link>
          <Link to="/legal/merchant-terms">Merchant Terms of Use</Link>
          <Link to="/legal/privacy">General Privacy Policy</Link>
        </nav>
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}
        <p className="legal-cta">
          <a href={appPath("/register")}>Create your shop</a>
        </p>
      </main>
    </div>
  );
}
