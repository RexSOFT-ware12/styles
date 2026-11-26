import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  if (testimonials.length === 0) return null;
  return (
    <section className="bg-muted/40 px-4 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">What designers say</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl border bg-card p-6">
              <blockquote className="text-sm leading-relaxed text-foreground">“{t.quote}”</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold text-foreground">{t.name}</span>
                {t.role && <span className="text-muted-foreground"> · {t.role}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
