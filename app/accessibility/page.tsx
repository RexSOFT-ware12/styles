import LegalLayout from "@/components/legal/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility — FabricNow",
  description: "FabricNow's commitment to an accessible shopping experience.",
};

export default function Accessibility() {
  return (
    <LegalLayout eyebrow="Legal" title="Accessibility Statement" updated="September 2026">
      <p>
        FabricNow is committed to making our site usable by as many people
        as possible, including people with disabilities.
      </p>

      <h2>Our approach</h2>
      <p>We aim to align with the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA, including:</p>
      <ul>
        <li>Sufficient color contrast between text and backgrounds.</li>
        <li>Keyboard-navigable menus, forms, and buttons.</li>
        <li>Descriptive alt text on product and content images.</li>
        <li>Clear, consistent page structure and headings.</li>
      </ul>

      <h2>Ongoing work</h2>
      <p>
        Accessibility is an ongoing effort rather than a one-time fix. As we
        add new features to the store, we review them for accessibility and
        correct issues as we find them.
      </p>

      <h2>Let us know if something isn&apos;t working</h2>
      <p>
        If you run into any part of the site that&apos;s difficult to use
        with a screen reader, keyboard, or other assistive technology,
        please tell us — we want to fix it. Reach us at{" "}
        <a href="mailto:info@fabricnow.com">info@fabricnow.com</a> or via
        our <a href="/contact">Contact page</a>, and include the page you
        were on and what happened, if you can.
      </p>
    </LegalLayout>
  );
}
