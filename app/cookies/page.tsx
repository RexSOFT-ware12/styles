import LegalLayout from "@/components/legal/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — FabricNow",
  description: "How FabricNow uses cookies and local storage.",
};

export default function CookiePolicy() {
  return (
    <LegalLayout eyebrow="Legal" title="Cookie Policy" updated="November 2026">
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

      <h2>Pinterest</h2>
      <p>
        Only if you press &quot;Accept all&quot; on our cookie banner, we load
        the Pinterest Tag. It lets Pinterest set cookies so we can measure
        which pins bring visitors and sales (page visits, items added to the
        cart and completed checkouts). Our Inspiration page can also show our
        Pinterest boards, which are delivered by Pinterest and may set its own
        cookies; if you haven&apos;t accepted, they only load when you press
        &quot;Show boards&quot;. If you press &quot;Decline&quot;, none of this
        loads. These cookies are governed by Pinterest&apos;s own privacy
        policy. The &quot;Save&quot; buttons on our product pages simply open
        Pinterest in a new window and don&apos;t load anything until you press
        them.
      </p>

      <h2>Payment processing</h2>
      <p>
        When you check out, Paystack may set its own cookies to process your
        payment securely and prevent fraud. These are governed by
        Paystack&apos;s own privacy practices, not ours.
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
        <a href="mailto:support@fabricnow.pro">support@fabricnow.pro</a> or via
        our <a href="/contact">Contact page</a>.
      </p>
    </LegalLayout>
  );
}
