"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Code,
  Download,
  LifeBuoy,
  Lock,
  PersonStanding,
  RotateCcw,
  Scissors,
  ScrollText,
  Shirt,
  ShieldCheck,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const USERS = 60000; // update this one number as you grow

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(to); // SSR/no-JS shows the real number
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - t0) / 1600, 1);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      setN(0);
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return <span ref={ref}>{n.toLocaleString("en-US")}+</span>;
}

const STEPS = [
  { n: "01", title: "Browse", text: "Search fabrics and ready-made 3D garments by style, fabric and brand.", href: "/shop", cta: "Open the shop" },
  { n: "02", title: "Pay & download", text: "Your file unlocks the moment you pay. Secure checkout via Paystack.", href: "/licensing", cta: "See licensing" },
  { n: "03", title: "Drop into CLO3D", text: "Files are tested and packaged — no re-mapping textures, no broken UVs.", href: "/help", cta: "Get help" },
  { n: "04", title: "Come back anytime", text: "Every purchase stays in My Purchases so you can re-download it.", href: "/account/purchases", cta: "My Purchases" },
];

const PRODUCTS = [
  { icon: Shirt, title: "Fabrics & Garments", text: "Studio-quality fabric assets and CLO3D .zprj garment files.", href: "/shop", tag: "Core library", span: "lg:col-span-2" },
  { icon: Sparkles, title: "Design Patterns", text: "Vector patterns traced to clean SVG, downloaded as a ready .zip.", href: "/design-patterns", tag: "Try the live demo", span: "" },
  { icon: Scissors, title: "Garment Tool", text: "Remove backgrounds and trace garment parts automatically.", href: "/account/garment-tool", tag: "Free 3-day trial", span: "" },
  { icon: PersonStanding, title: "Pose Tool", text: "Pose notes for CLO3D's Avatar Pose editor plus turnaround references.", href: "/account/pose-tool", tag: "Free 3-day trial", span: "" },
  { icon: Code, title: "API for developers", text: "Background removal and garment segmentation inside your own app.", href: "/developers", tag: "Self-serve plans", span: "" },
  { icon: Wand2, title: "Premium", text: "Unlimited access to every tool. Cancel anytime.", href: "/pricing", tag: "Start free", span: "lg:col-span-3" },
];

const TRUST = [
  { icon: ShieldCheck, title: "Tested files", text: "Built to hold up under real draping and lighting, not just thumbnails.", href: "/about" },
  { icon: Lock, title: "Secure checkout", text: "Payments are processed by Paystack. We never see your card.", href: "/checkout" },
  { icon: ScrollText, title: "Clear licensing", text: "Know exactly what you can do with every download.", href: "/licensing" },
  { icon: RotateCcw, title: "Fair returns", text: "A written returns policy, no hunting for it.", href: "/returns" },
  { icon: LifeBuoy, title: "Real support", text: "Help Center, contact form and a human at support@fabricnow.pro.", href: "/contact" },
];

export default function Landing() {
  return (
    <div className="bg-background text-foreground overflow-hidden">
      {/* HERO */}
      <section className="relative isolate px-4 pt-20 pb-24 sm:pt-28 lg:pt-36 lg:pb-32">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
          <div className="absolute right-[-10%] top-1/3 h-[320px] w-[320px] rounded-full bg-accent-foreground/10 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-60 [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            }}
          />
        </div>

        <div className="mx-auto max-w-4xl text-center motion-safe:animate-[rise-in_0.6s_ease-out]">
          <Badge variant="secondary" className="mb-6 gap-2 rounded-full border border-primary/30 bg-background/70 px-4 py-1.5 backdrop-blur">
            <Users className="h-3.5 w-3.5 text-primary" />
            Trusted by <strong className="font-semibold"><CountUp to={USERS} /></strong> designers
          </Badge>
          <h1 className="text-5xl font-semibold tracking-tighter text-balance sm:text-6xl lg:text-7xl lg:leading-[1.02]">
            From idea to 3D render{" "}
            <span className="bg-gradient-to-r from-primary to-amber-700 bg-clip-text text-transparent">in minutes.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance">
            FabricNow gives fashion designers studio-quality CLO3D fabrics and garments, plus
            AI-assisted tools that cut the prep work. Download, open, design.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link href="/shop">Browse the library <ArrowRight /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
              <Link href="/signup">Start your free 3-day trial</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No shipping. Instant download. Cancel anytime.</p>
        </div>

        {/* stat strip */}
        <dl className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border shadow-lg lg:grid-cols-4">
          {[
            [<CountUp key="u" to={USERS} />, "designers use FabricNow"],
            ["Instant", "download after payment"],
            ["Forever", "re-download from My Purchases"],
            ["3 days", "free trial of every tool"],
          ].map(([v, l], i) => (
            <div key={i} className="bg-card/90 p-6 text-center backdrop-blur">
              <dt className="text-3xl font-semibold tracking-tight text-primary">{v}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Four steps. No friction.</h2>
          </div>
          <ol className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div aria-hidden className="absolute left-0 right-0 top-9 hidden border-t-2 border-dashed border-primary/30 lg:block" />
            {STEPS.map((s) => (
              <li key={s.n} className="relative">
                <Link href={s.href} className="group block h-full rounded-2xl border bg-card p-6 transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
                  <span className="relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground ring-8 ring-background">{s.n}</span>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {s.cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* EVERYTHING IN ONE PLACE */}
      <section className="bg-muted/40 px-4 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">The platform</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Everything a 3D fashion workflow needs</h2>
            <p className="mt-3 text-muted-foreground">Start with files. Add tools when you&apos;re ready.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {PRODUCTS.map(({ icon: Icon, title, text, href, tag, span }) => (
              <Link key={title} href={href} className={`group relative overflow-hidden rounded-2xl border bg-card p-7 transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl ${span}`}>
                <div aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-primary/25" />
                <div className="relative">
                  <div className="mb-5 inline-flex rounded-xl bg-primary/10 p-3"><Icon className="h-6 w-6 text-primary" /></div>
                  <Badge variant="secondary" className="mb-3 block w-fit">{tag}</Badge>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">{text}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="px-4 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">Why designers stay</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              <CountUp to={USERS} /> designers. A real business behind every download.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {TRUST.map(({ icon: Icon, title, text, href }) => (
              <Link key={title} href={href} className="rounded-2xl border bg-card p-5 transition hover:border-primary/50 hover:shadow-lg">
                <Icon className="mb-3 h-6 w-6 text-primary" />
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Read <Link href="/about" className="text-primary underline-offset-4 hover:underline">our story</Link>,{" "}
            see us in the <Link href="/press" className="text-primary underline-offset-4 hover:underline">press page</Link>, or{" "}
            <Link href="/blog" className="text-primary underline-offset-4 hover:underline">follow the blog</Link>.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 pb-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-accent p-10 text-center sm:p-16">
          <div aria-hidden className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative">
            <Download className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">Join <CountUp to={USERS} /> designers building in 3D.</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Create a free account, try every tool for 3 days, and download your first file today.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="h-12 px-8 text-base"><Link href="/signup">Create free account <ArrowRight /></Link></Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base"><Link href="/pricing">See Premium</Link></Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
