import { staticPageMeta, usePageMeta } from "../seo";
import "./legal.css";

export default function NotFoundPage() {
  usePageMeta(staticPageMeta("/missing"));

  return (
    <div className="legal">
      <header>
        <div className="wrap">
          <nav aria-label="Breadcrumb">
            <a href="/">Sakora</a>
          </nav>
          <h1>Page not found</h1>
          <p>This page does not exist.</p>
        </div>
      </header>
      <main className="wrap">
        <p>
          <a href="/">Back to the homepage</a>
        </p>
      </main>
    </div>
  );
}
