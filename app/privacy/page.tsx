import LegalLayout from "@/components/legal/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — FabricNow",
  description: "How FabricNow collects, uses, and protects your information.",
};

export default function PrivacyPolicy() {
  return (
    <LegalLayout eyebrow="Legal" title="Privacy Policy" updated="September 2026">
      <p>
        This policy explains what information FabricNow (&quot;we&quot;,
        &quot;us&quot;) collects when you use fabricnow.com, and how we use
        and protect it. By using the site, you agree to the practices
        described here.
      </p>

      <h2>Information we collect</h2>
      <p>We collect information in a few ways:</p>
      <ul>
        <li>
          <strong>Account information</strong> — your name and email address
          when you create an account or sign in.
        </li>
        <li>
          <strong>Order information</strong> — the products you purchase and
          your order history, so we can deliver your files and let you
          re-download them later.
        </li>
        <li>
          <strong>Payment information</strong> — payments are processed by
          Stripe. We never see or store your full card number; Stripe
          handles that under its own privacy and security practices.
        </li>
        <li>
          <strong>Usage information</strong> — basic technical data like
          browser type and pages visited, used only to keep the site working
          reliably.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To process orders and deliver your digital downloads.</li>
        <li>To let you sign in and view your purchase history.</li>
        <li>To respond to support requests you send us.</li>
        <li>To send you order confirmations and, if you opt in, our newsletter.</li>
      </ul>
      <p>We don&apos;t sell your personal information to third parties.</p>

      <h2>Cookies and local storage</h2>
      <p>
        We use essential cookies and browser storage to keep you signed in
        and remember your cart. See our{" "}
        <a href="/cookies">Cookie Policy</a> for details.
      </p>

      <h2>Third-party services</h2>
      <p>
        We share the minimum data necessary with a small number of service
        providers to run the store — Stripe for payments, and our hosting and
        file-storage providers for delivering your downloads. These
        providers only use your data to provide their service to us.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep account and order records for as long as your account is
        active, so you can always re-download what you&apos;ve purchased. If
        you&apos;d like your account deleted, contact us and we&apos;ll take
        care of it, subject to any records we&apos;re required to keep for
        legal or tax purposes.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask us to access, correct, or delete your personal
        information at any time by contacting us. Depending on where you
        live, you may have additional rights under local law.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>
        FabricNow is not directed at children under 13, and we don&apos;t
        knowingly collect information from them.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. If we make significant
        changes, we&apos;ll post the updated date at the top of this page.
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
