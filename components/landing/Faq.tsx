const FAQS: { q: string; a: string }[] = [
  {
    q: "What do I get when I buy a file?",
    a: "A digital download — fabric assets or a ready-made CLO3D garment (.zprj). Nothing is shipped; the download unlocks the moment your payment succeeds.",
  },
  {
    q: "Can I download my files again?",
    a: "Yes. Every file you buy can be re-downloaded for free, any time, from your account.",
  },
  {
    q: "How does the free trial work?",
    a: "Every account gets a 3-day free trial of the Garment Tool, Pose Tool and SVG customization. See the Pricing page for what Premium adds after that.",
  },
  {
    q: "Is checkout secure?",
    a: "Payments are processed by Paystack. We never see or store your card details.",
  },
  {
    q: "What if a file won’t open or I was charged twice?",
    a: "Contact support with your order number and we’ll sort it out — see our Returns page for exactly when we help and how refunds work for digital files.",
  },
  {
    q: "Can I use the files in my own designs?",
    a: "Yes. The Licensing page explains what you can and can’t do with each file.",
  },
];

export default function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <section id="faq" className="px-4 py-20 lg:py-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-primary">FAQ</p>
        <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight sm:text-4xl">Questions, answered</h2>
        <div className="mt-10 divide-y rounded-2xl border bg-card">
          {FAQS.map((f) => (
            <details key={f.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="text-xl leading-none text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
