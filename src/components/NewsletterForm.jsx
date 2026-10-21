import { useState } from "react";
import { API_URL } from "../config";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${API_URL}/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          company: form.get("company") || "",
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body.success === false) {
        setStatus(body.message || "Could not subscribe. Try again.");
        return;
      }
      setStatus(body.message || "You are on the list.");
      setEmail("");
    } catch (error) {
      setStatus("Could not subscribe. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="newsletter-form" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        maxLength={180}
        placeholder="Email address"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <input
        className="newsletter-trap"
        tabIndex={-1}
        autoComplete="off"
        name="company"
        aria-hidden="true"
      />
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? "Subscribing…" : "Subscribe"}
      </button>
      <p className="newsletter-status" role="status">
        {status}
      </p>
    </form>
  );
}
