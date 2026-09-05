import LegalLayout from "@/components/legal/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — FabricNow",
  description: "How FabricNow uses cookies and local storage.",
};

export default function CookiePolicy() {
  return (
    <LegalLayout eyebrow="Legal" title="Cookie Policy" updated="September 2026">
      <p>
        This page explains how FabricNow uses cookies and similar browser
        storage, and the choices you have.
      </p>

      <h2>What we use today</h2>
      <ul>
        <li>
          <strong>Essential session storage</strong> — when you sign in, we
          store a session token in your browser so you stay signed in and
          can view your cart and purchase history. Without this, the site
          can&apos;t remember who you are between pages.
        </li>
        <li>
          <strong>Cart storage</strong> — items you add to your cart are
          kept in your browser so they&apos;re still there if you come back
          later.
        </li>
      </ul>
      <p>
        We don&apos;t currently use third-party advertising or tracking
        cookies.
      </p>

      <h2>Payment processing</h2>
      <p>
        When you check out, Stripe may set its own cookies to process your
        payment securely and prevent fraud. These are governed by
        Stripe&apos;s own privacy practices, not ours.
      </p>

      <h2>Managing storage in your browser</h2>
      <p>
        You can clear cookies and local storage at any time through your
        browser&apos;s settings. Doing so will sign you out and clear your
        local cart, but won&apos;t affect your account or past orders.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If how we use cookies changes — for example, if we add analytics in
        the future — we&apos;ll update this page and the date above.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions about this policy? Reach us at{" "}
        <a href="mailto:info@fabricnow.com">info@fabricnow.com</a> or via
        our <a href="/contact">Contact page</a>.
      </p>
    </LegalLayout>
  );
}
