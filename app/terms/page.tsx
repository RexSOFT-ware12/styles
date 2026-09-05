import LegalLayout from "@/components/legal/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — FabricNow",
  description: "The terms that govern your use of FabricNow.",
};

export default function Terms() {
  return (
    <LegalLayout eyebrow="Legal" title="Terms & Conditions" updated="September 2026">
      <p>
        These terms govern your use of fabricnow.com and the digital
        products sold on it. By creating an account or making a purchase,
        you agree to them.
      </p>

      <h2>Digital products</h2>
      <p>
        Everything we sell is delivered as a digital download — there is no
        physical shipping. Once you check out, your files unlock
        immediately and stay available for re-download from{" "}
        <a href="/account/purchases">My Purchases</a>.
      </p>

      <h2>License</h2>
      <p>
        Purchasing a product grants you a license to use the included files
        in your own personal or commercial design work (for example,
        garments, portfolios, or client projects). See our{" "}
        <a href="/licensing">Download &amp; Licensing</a> page for the full
        terms of what you can and can&apos;t do with a purchased file.
        Reselling or redistributing the source files themselves is not
        permitted.
      </p>

      <h2>Accounts</h2>
      <p>
        You&apos;re responsible for keeping your account credentials secure
        and for any activity that happens under your account. Let us know
        right away if you think your account has been compromised.
      </p>

      <h2>Payment</h2>
      <p>
        Prices are shown in USD and charged at checkout through Stripe.
        We reserve the right to correct pricing errors before an order is
        completed.
      </p>

      <h2>Refunds</h2>
      <p>
        Because purchases unlock a digital file instantly, we generally
        don&apos;t offer refunds once a download has started. Full details,
        including how we handle corrupted or incorrect files, are on our{" "}
        <a href="/returns">Returns &amp; Exchanges</a> page.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Share your account or purchased files with people who haven&apos;t bought them.</li>
        <li>Re-upload or resell our source files as your own downloadable assets.</li>
        <li>Use the site in any way that disrupts or attempts to compromise it.</li>
      </ul>

      <h2>Disclaimer and limitation of liability</h2>
      <p>
        Products are provided &quot;as is.&quot; We work hard to make sure
        files open cleanly in compatible software, but we can&apos;t
        guarantee compatibility with every version or configuration. To the
        extent permitted by law, FabricNow isn&apos;t liable for indirect or
        consequential damages arising from your use of the site or its
        products.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms occasionally. Continuing to use the site
        after a change means you accept the updated terms.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions about these terms? Reach us at{" "}
        <a href="mailto:info@fabricnow.com">info@fabricnow.com</a> or via
        our <a href="/contact">Contact page</a>.
      </p>
    </LegalLayout>
  );
}
