import React, { useEffect, useState } from "react";
import { appPath } from "../config";
import GetTheApp from "../components/GetTheApp";
import NewsletterForm from "../components/NewsletterForm";
import { staticPageMeta, usePageMeta } from "../seo";
import "./landing.css";

const PROFIT = [
  { label: "Revenue", amount: "₦128,400" },
  { label: "Cost of sales", amount: "₦76,800" },
  { label: "Gross profit", amount: "₦51,600", tone: "sub" },
  { label: "Expenses", amount: "₦18,400" },
  { label: "Net profit", amount: "₦33,200", tone: "total" },
];

const FEATURES = [
  {
    title: "Profit",
    text: "Revenue, cost of sales, gross profit, expenses, and net profit for the day.",
  },
  {
    title: "Sales",
    text: "Record cash, transfer, and card sales at the counter without a separate till.",
  },
  {
    title: "Inventory",
    text: "Products, stock on hand, and a warning when an item is running low.",
  },
  {
    title: "Expenses",
    text: "Log rent, transport, and other costs so the profit figure stays honest.",
  },
  {
    title: "Purchases",
    text: "Record what you buy from suppliers and the cost that sits in each sale.",
  },
  {
    title: "Invoices",
    text: "Send an invoice on WhatsApp and see what customers still owe.",
  },
  {
    title: "Online shop",
    text: "Share sakora.shop/your-shop. Customers browse, order, pay, and track delivery.",
  },
  {
    title: "Customers",
    text: "Keep names, phone numbers, and a simple history of what they bought.",
  },
  {
    title: "Team and branches",
    text: "Add staff and roles, then open another branch when the shop grows.",
  },
  {
    title: "Reports and VAT",
    text: "Review the month, see VAT, and know what the business made.",
  },
];

const STORIES = [
  {
    youtubeId: "T_2NB_9YJEI",
    name: "Small business owner",
    shop: "Spice trade, Kano",
    quote: "I run the shop from my phone and still know what sold today.",
  },
  {
    youtubeId: "SCBghr7cqR8",
    name: "Provision seller",
    shop: "Everyday groceries",
    quote: "Recording sales used to live in a book. Now I see the day at a glance.",
  },
  {
    youtubeId: "700BxGXs3l4",
    name: "Store founder",
    shop: "Provision store",
    quote: "If you can stock the shop, you can share it and keep selling.",
  },
];

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: "₦4,000/mo",
    summary: "A single shop, sales, and stock.",
    features: [
      "1 shop and 1 user",
      "Products and low-stock alerts",
      "Cash and transfer sales",
      "Customers and quotations",
    ],
    cta: "Choose Starter",
    tone: "ghost",
  },
  {
    key: "growth",
    name: "Growth",
    price: "₦12,000/mo",
    summary: "Online shop, invoices, and a small team.",
    features: [
      "Everything in Starter",
      "Public storefront and invoices",
      "Squad checkout",
      "WhatsApp sharing",
      "Up to 3 staff",
    ],
    cta: "Choose Growth",
    tone: "primary",
    popular: true,
  },
  {
    key: "business",
    name: "Business",
    price: "₦20,000/mo",
    summary: "Teams, branches, and fuller reports.",
    features: [
      "Everything in Growth",
      "Unlimited staff and roles",
      "Multiple branches",
      "Reports and VAT",
      "Priority support",
    ],
    cta: "Choose Business",
    tone: "dark",
  },
];

const thumb = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStory, setActiveStory] = useState(0);
  const [playing, setPlaying] = useState(false);

  usePageMeta(staticPageMeta("/"));

  useEffect(() => {
    const previousScroll = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";

    const items = document.querySelectorAll(".landing .reveal-on-scroll");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
          }
        });
      },
      { threshold: 0.16 }
    );
    items.forEach((item) => observer.observe(item));

    return () => {
      document.documentElement.style.scrollBehavior = previousScroll;
      observer.disconnect();
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const story = STORIES[activeStory];

  return (
    <div className="landing">
      <header className={`nav${menuOpen ? " open" : ""}`}>
        <div className="wrap nav-inner">
          <a className="brand" href="#top" onClick={closeMenu}>
            <img src="/brand.svg" alt="" />
            Sakora
          </a>
          <nav className="nav-links">
            <a href="#features" onClick={closeMenu}>
              Features
            </a>
            <a href="#stories" onClick={closeMenu}>
              Stories
            </a>
            <a href="#pricing" onClick={closeMenu}>
              Pricing
            </a>
            <a href="#download" onClick={closeMenu}>
              Download
            </a>
            <a href="#faq" onClick={closeMenu}>
              FAQ
            </a>
            <a href="/track" onClick={closeMenu}>
              Track order
            </a>
          </nav>
          <div className="nav-cta">
            <a className="btn btn-ghost" href={appPath("/login")}>
              Sign in
            </a>
            <a className="btn btn-primary" href={appPath("/register")}>
              Get started
            </a>
          </div>
          <button
            className="menu-btn"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            ☰
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy reveal">
              <p className="kicker">Selling made easy</p>
              <h1>Manage inventory, sales, and invoices from your phone.</h1>
              <p className="lead">
                If you sell from a supermarket, pharmacy, stall, or WhatsApp,
                Sakora keeps stock, daily sales, invoices, and your online store
                in one place. See revenue, cost of sales, gross profit, expenses,
                and net profit from your phone.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary btn-lg" href={appPath("/register")}>
                  Create your shop
                </a>
                <a className="btn btn-dark btn-lg" href="#features">
                  See how it works
                </a>
              </div>
              <p className="hero-note">
                Plans from ₦4,000 a month. Share a shop link in minutes.
              </p>
              <GetTheApp />
            </div>

            <div className="phone-wrap reveal delay-2">
              <div className="phone float">
                <div className="phone-screen">
                  <div className="phone-home">
                    <p>Today · Ada&apos;s Provisions</p>
                    <h3>Net profit</h3>
                    <strong>₦33,200</strong>
                  </div>
                  <ul className="phone-statement">
                    {PROFIT.map((row) => (
                      <li
                        key={row.label}
                        className={row.tone ? `is-${row.tone}` : undefined}
                      >
                        <span>{row.label}</span>
                        <b>{row.amount}</b>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="who">
          <div className="wrap reveal-on-scroll">
            <p className="kicker">Built for everyday sellers</p>
            <h2>
              Sakora makes it easy to run your retail business and sell online.
            </h2>
            <p className="lead">
              Keep track of inventory, monitor daily sales, send invoices, and
              collect payment with Squad — from your phone.
            </p>
            <div className="who">
              <article>
                <h3>Supermarkets</h3>
                <p>
                  Record sales fast and know what is running low before the day
                  ends.
                </p>
              </article>
              <article>
                <h3>Pharmacies</h3>
                <p>
                  Track stock, suppliers, and every sale without a bulky
                  back-office setup.
                </p>
              </article>
              <article>
                <h3>Groceries & stalls</h3>
                <p>
                  Share products on WhatsApp and still keep a proper sales
                  record.
                </p>
              </article>
              <article>
                <h3>Home sellers</h3>
                <p>
                  Get a shop link customers can browse, order from, and pay on.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section alt" id="features">
          <div className="wrap reveal-on-scroll">
            <p className="kicker">What you can do</p>
            <h2>Sales, stock, and the profit in between.</h2>
            <p className="lead">
              Run the shop from your phone. The day shows what came in, what it
              cost, and what is left.
            </p>
            <div className="feature-grid">
              {FEATURES.map((feature) => (
                <article key={feature.title}>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap split reveal-on-scroll">
            <div className="feature-card">
              <h3>WhatsApp + website</h3>
              <p>
                Share a product, send an invoice, or drop your shop link in a
                status. Customers can also pay with Squad.
              </p>
            </div>
            <div className="copy">
              <p className="kicker">Sell where your customers are</p>
              <h2>See your sales go up, day by day.</h2>
              <p>
                View sales by day, week, or month. Create invoices, fulfil
                online orders, and keep stock in sync after every sale.
              </p>
            </div>
          </div>
        </section>

        <section className="section alt" id="stories">
          <div className="wrap reveal-on-scroll">
            <p className="kicker">Customer stories</p>
            <h2>Hear from sellers like you.</h2>
            <p className="lead">
              Shop owners talking about running a store from their phone — the
              same way Sakora is built to work.
            </p>
            <div className="stories">
              <div className="story-player">
                <div className="story-frame">
                  {playing ? (
                    <iframe
                      key={story.youtubeId}
                      src={`https://www.youtube.com/embed/${story.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                      title={story.name}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <img
                        src={thumb(story.youtubeId)}
                        alt={story.name}
                        loading="lazy"
                        decoding="async"
                      />
                      <button
                        className="story-play"
                        type="button"
                        aria-label="Play testimonial"
                        onClick={() => setPlaying(true)}
                      >
                        <span>▶</span>
                      </button>
                    </>
                  )}
                </div>
                <blockquote>“{story.quote}”</blockquote>
                <p className="story-meta">
                  {story.name} · {story.shop}
                </p>
              </div>
              <div className="story-list">
                {STORIES.map((item, index) => (
                  <button
                    key={item.youtubeId}
                    type="button"
                    className={`story-card${index === activeStory ? " is-active" : ""}`}
                    onClick={() => {
                      setActiveStory(index);
                      setPlaying(true);
                    }}
                  >
                    <img
                      src={thumb(item.youtubeId)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.shop}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="how">
          <div className="wrap reveal-on-scroll">
            <p className="kicker">Get going</p>
            <h2>Create your shop, add products, start selling.</h2>
            <div className="steps">
              <article>
                <div className="num">1</div>
                <h3>Create your shop</h3>
                <p>
                  Sign up with your business name. You get a shop link
                  immediately.
                </p>
              </article>
              <article>
                <div className="num">2</div>
                <h3>Add what you sell</h3>
                <p>
                  Name, price, and stock. Show items in your online shop with
                  one tap.
                </p>
              </article>
              <article>
                <div className="num">3</div>
                <h3>Share and get paid</h3>
                <p>
                  Send the shop or an invoice on WhatsApp. Collect payment with
                  Squad.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="pricing">
          <div className="wrap reveal-on-scroll">
            <p className="kicker">Pricing</p>
            <h2>Three monthly plans.</h2>
            <p className="lead">
              Starter is ₦4,000, Growth is ₦12,000, and Business is ₦20,000.
              Payment happens in the app with Squad.
            </p>
            <div className="pricing">
              {PLANS.map((plan) => (
                <article
                  key={plan.name}
                  className={plan.popular ? "popular" : undefined}
                >
                  {plan.popular ? <p className="badge">Most popular</p> : null}
                  <h3>{plan.name}</h3>
                  <p className="price">{plan.price}</p>
                  <p>{plan.summary}</p>
                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <a
                    className={`btn btn-${plan.tone}`}
                    href={appPath(
                      `/register?next=${encodeURIComponent(`/billing?plan=${plan.key}&signup=1`)}`
                    )}
                  >
                    {plan.cta}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div className="wrap reveal-on-scroll">
            <h2>Download, set up, and start selling.</h2>
            <p>Open Sakora on the web, create your shop, and share it today.</p>
            <a className="btn btn-primary btn-lg" href={appPath("/register")}>
              Create your shop
            </a>
          </div>
        </section>

        <section className="section alt" id="download">
          <div className="wrap reveal-on-scroll">
            <p className="kicker">Download Sakora</p>
            <h2>Phone, tablet, or computer.</h2>
            <p className="lead">
              Download Sakora for Mac and Windows, or get it on the App Store
              and Google Play.
            </p>
            <GetTheApp />
            <p className="hero-note">
              <a href={appPath("/register")}>Create your shop in the browser</a>
            </p>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="wrap faq reveal-on-scroll">
            <p className="kicker">Questions</p>
            <h2>Before you start</h2>
            <details open>
              <summary>Can I see profit, not only sales?</summary>
              <p>
                Yes. Each day shows revenue, cost of sales, gross profit,
                expenses, and net profit.
              </p>
            </details>
            <details>
              <summary>Do I need a computer?</summary>
              <p>
                No. Sakora is built for your phone. You can also use a tablet
                or laptop if you want a bigger screen.
              </p>
            </details>
            <details>
              <summary>How do customers pay?</summary>
              <p>
                They can pay through your shop checkout with Squad, or you can
                record a cash or transfer sale yourself.
              </p>
            </details>
            <details>
              <summary>Can I sell on WhatsApp?</summary>
              <p>
                Yes. Share a product, invoice, or your full shop link.
                Customers message you or pay online.
              </p>
            </details>
            <details>
              <summary>How much does Sakora cost?</summary>
              <p>
                Starter is ₦4,000 a month, Growth is ₦12,000, and Business is
                ₦20,000. You pay with Squad from Billing in the app.
              </p>
            </details>
          </div>
        </section>
      </main>

      <section className="newsletter" id="newsletter">
        <div className="wrap newsletter-inner">
          <div>
            <p className="kicker">Newsletter</p>
            <h2>Notes for shop owners.</h2>
            <p>
              Occasional updates on selling, stock, and new Sakora features.
            </p>
          </div>
          <div>
            <NewsletterForm />
            <p className="newsletter-note">
              Product updates only. See the{" "}
              <a href="/legal/privacy">privacy policy</a>.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <a className="brand" href="#top">
              <img src="/brand.svg" alt="" />
              Sakora
            </a>
            <p className="blurb">
              Inventory, sales, invoices, and a shareable shop for businesses
              that sell from a phone.
            </p>
            <GetTheApp />
          </div>
          <nav aria-label="Product">
            <p className="footer-title">Product</p>
            <ul>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#stories">Stories</a>
              </li>
              <li>
                <a href="#pricing">Pricing</a>
              </li>
              <li>
                <a href="#download">Download</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
              <li>
                <a href="#newsletter">Newsletter</a>
              </li>
            </ul>
          </nav>
          <nav aria-label="Account">
            <p className="footer-title">Account</p>
            <ul>
              <li>
                <a href={appPath("/register")}>Create your shop</a>
              </li>
              <li>
                <a href={appPath("/login")}>Sign in</a>
              </li>
            </ul>
          </nav>
          <nav aria-label="Legal">
            <p className="footer-title">Legal</p>
            <ul>
              <li>
                <a href="/legal/terms">Terms of use</a>
              </li>
              <li>
                <a href="/legal/merchant-terms">Merchant terms</a>
              </li>
              <li>
                <a href="/legal/privacy">Privacy policy</a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="wrap footer-bottom">
          <p>© {new Date().getFullYear()} Sakora. All rights reserved.</p>
          <p>
            Powered by{" "}
            <a href="https://nexifour.ng" target="_blank" rel="noreferrer">
              Nexifour Limited
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
