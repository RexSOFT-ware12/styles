"use client";
// All landing-page effects. No extra dependencies. Swap-in points are marked "SWAP:".
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const DRESS = "M70 20 L100 34 L130 20 L160 60 L140 80 L134 70 L142 240 L58 240 L66 70 L60 80 L40 60 Z";

// SWAP: replace `css` with real fabric image URLs, e.g. css: "url(/images/fabrics/denim.jpg) center/cover", and set href to the product page.
const FABRICS = [
  { name: "Indigo twill", href: "/shop?q=denim", css: "repeating-linear-gradient(45deg,#1e3a5f 0 3px,#27507f 3px 6px)" },
  { name: "Gingham", href: "/shop?q=gingham", css: "repeating-linear-gradient(0deg,#c2410c66 0 8px,transparent 8px 16px),repeating-linear-gradient(90deg,#c2410c66 0 8px,transparent 8px 16px),#fff7ed" },
  { name: "Pinstripe", href: "/shop?q=pinstripe", css: "repeating-linear-gradient(90deg,#e5e7eb 0 2px,#374151 2px 14px)" },
  { name: "Tartan", href: "/shop?q=plaid", css: "repeating-linear-gradient(0deg,#16653466 0 6px,transparent 6px 20px),repeating-linear-gradient(90deg,#7f1d1d99 0 10px,transparent 10px 24px),#14532d" },
  { name: "Velvet", href: "/shop?q=velvet", css: "radial-gradient(circle at 30% 20%,#9d174d,#4c0519)" },
  { name: "Linen weave", href: "/shop?q=linen", css: "repeating-linear-gradient(0deg,#d6c7a1 0 2px,#e7dcc0 2px 4px),#e7dcc0" },
];

/* GLOBAL: glow-on-cards, magnetic buttons, shared keyframes */
export function GlobalFx() {
  useEffect(() => {
    if (reduced()) return;
    let last: HTMLElement | null = null;
    const move = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      const g = t.closest<HTMLElement>("[data-glow]");
      if (g) { const r = g.getBoundingClientRect(); g.style.setProperty("--x", `${e.clientX - r.left}px`); g.style.setProperty("--y", `${e.clientY - r.top}px`); }
      const m = t.closest<HTMLElement>("[data-magnetic]");
      if (last && last !== m) last.style.transform = "";
      if (m) { const r = m.getBoundingClientRect(); m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px,${(e.clientY - r.top - r.height / 2) * 0.2}px)`; }
      last = m;
    };
    document.addEventListener("pointermove", move);
    return () => document.removeEventListener("pointermove", move);
  }, []);
  return (
    <style>{`
      [data-glow]{position:relative}
      [data-glow]::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .25s;background:radial-gradient(240px circle at var(--x,50%) var(--y,50%),rgb(217 119 6/.18),transparent 70%)}
      [data-glow]:hover::after{opacity:1}
      [data-magnetic]{display:inline-block;transition:transform .18s ease-out}
      @keyframes fn-marquee{to{transform:translateX(-50%)}}
      @keyframes fn-stitch{to{stroke-dashoffset:-24}}
      @media (prefers-reduced-motion:reduce){[data-magnetic]{transition:none}}
    `}</style>
  );
}

/* 1. LIVING FABRIC HERO: a cloth mesh that ripples and reacts to the mouse */
export function ClothBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!, ctx = c.getContext("2d")!;
    const still = reduced();
    let w = 0, h = 0, raf = 0, mx = -999, my = -999, vx = 0, vy = 0, pmx = 0, pmy = 0;
    const N = 26, M = 14;
    const size = () => { const r = c.parentElement!.getBoundingClientRect(); w = c.width = r.width; h = c.height = r.height; };
    size();
    const pm = (e: PointerEvent) => { const r = c.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; vx = mx - pmx; vy = my - pmy; pmx = mx; pmy = my; };
    window.addEventListener("pointermove", pm); window.addEventListener("resize", size);
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const pts: [number, number][][] = [];
      for (let j = 0; j <= M; j++) { const row: [number, number][] = [];
        for (let i = 0; i <= N; i++) {
          const x = (i / N) * w * 1.1 - w * 0.05, y = (j / M) * h;
          let dz = Math.sin(i * 0.5 + t / 900 + j * 0.3) * 10 + Math.cos(j * 0.6 + t / 1300) * 8;
          const d = Math.hypot(x - mx, y - my), f = Math.max(0, 1 - d / 220);
          dz += f * f * 46 * Math.sign(vy || 1) * Math.min(1, Math.hypot(vx, vy) / 12 + 0.4);
          row.push([x + dz * 0.4, y + dz]);
        } pts.push(row); }
      ctx.lineWidth = 1;
      for (let j = 0; j <= M; j++) { ctx.beginPath(); pts[j].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.strokeStyle = "rgba(217,119,6,.28)"; ctx.stroke(); }
      for (let i = 0; i <= N; i++) { ctx.beginPath(); for (let j = 0; j <= M; j++) (j ? ctx.lineTo(pts[j][i][0], pts[j][i][1]) : ctx.moveTo(pts[j][i][0], pts[j][i][1])); ctx.strokeStyle = "rgba(217,119,6,.16)"; ctx.stroke(); }
      vx *= 0.9; vy *= 0.9;
      if (!still) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", pm); window.removeEventListener("resize", size); };
  }, []);
  return <canvas ref={ref} aria-hidden className="absolute inset-0 -z-10 h-full w-full opacity-80 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />;
}

/* 10. ASK FIBO: one-tap prompts that jump into the shop search */
export function FiboBubble() {
  const r = useRouter();
  const [q, setQ] = useState("");
  const go = (s: string) => s.trim() && r.push(`/shop?q=${encodeURIComponent(s.trim())}`); // SWAP: point at the real Fibo endpoint
  return (
    <div className="mx-auto mt-8 max-w-xl text-left">
      <form onSubmit={(e) => { e.preventDefault(); go(q); }} className="flex items-center gap-2 rounded-full border bg-card/80 py-1.5 pl-4 pr-1.5 shadow-sm backdrop-blur">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Ask Fibo" placeholder="Ask Fibo: find me a streetwear fabric" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        <Button type="submit" size="sm" className="rounded-full">Ask</Button>
      </form>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {["Streetwear fabric", "Linen for summer", "Wedding dress satin"].map((p) => (
          <button key={p} onClick={() => go(p)} className="rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground">{p}</button>
        ))}
      </div>
    </div>
  );
}

/* 2. TRACER DEMO: drop an image, watch it trace row by row */
export function TracerDemo() {
  const [paths, setPaths] = useState<string[]>([]);
  const [shown, setShown] = useState(0);
  const [dim, setDim] = useState<[number, number]>([80, 80]);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  const trace = (img: CanvasImageSource, iw: number, ih: number) => {
    const W = 80, H = Math.max(1, Math.round((ih / iw) * W)), c = document.createElement("canvas");
    c.width = W; c.height = H; const x = c.getContext("2d")!; x.fillStyle = "#fff"; x.fillRect(0, 0, W, H); x.drawImage(img, 0, 0, W, H);
    const d = x.getImageData(0, 0, W, H).data, rows: string[] = [];
    for (let y = 0; y < H; y++) { let s = "", run = -1;
      for (let i = 0; i <= W; i++) { const k = (y * W + i) * 4, dark = i < W && d[k + 3] > 0 && (d[k] * 0.3 + d[k + 1] * 0.59 + d[k + 2] * 0.11) < 140;
        if (dark && run < 0) run = i; if (!dark && run >= 0) { s += `M${run} ${y}h${i - run}v1h-${i - run}z`; run = -1; } }
      rows.push(s); }
    setDim([W, H]); setPaths(rows); setShown(0); clearInterval(timer.current);
    timer.current = setInterval(() => setShown((n) => { if (n >= rows.length) { clearInterval(timer.current); return n; } return n + 2; }), 30);
  };
  const sample = () => { // built-in sample so visitors see it work with zero effort
    const c = document.createElement("canvas"); c.width = c.height = 200; const x = c.getContext("2d")!;
    x.fillStyle = "#fff"; x.fillRect(0, 0, 200, 200); x.fillStyle = "#000"; x.font = "bold 120px serif"; x.textAlign = "center"; x.fillText("Fn", 100, 135);
    x.beginPath(); for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 - Math.PI / 2, r = i % 2 ? 14 : 30; x.lineTo(100 + r * Math.cos(a), 40 + r * Math.sin(a) - 10); } x.fill();
    trace(c, 200, 200);
  };
  useEffect(() => { sample(); return () => clearInterval(timer.current); }, []); // eslint-disable-line
  const file = (f?: File) => { if (!f || !f.type.startsWith("image/")) return; const im = new Image(); im.onload = () => trace(im, im.width, im.height); im.src = URL.createObjectURL(f); };
  const d = paths.slice(0, shown).join(""), done = shown >= paths.length;
  const dl = () => { const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim[0]} ${dim[1]}"><path d="${paths.join("")}"/></svg>`; const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })); a.download = "fabricnow-trace.svg"; a.click(); };
  return (
    <div data-glow onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); file(e.dataTransfer.files[0]); }} className="rounded-2xl border bg-card p-5">
      <h3 className="font-semibold">Trace an image to SVG, right now</h3>
      <p className="mt-1 text-sm text-muted-foreground">Drop a PNG or JPG here. No account needed.</p>
      <div className="mt-4 grid place-items-center rounded-xl bg-muted/50 p-3">
        <svg viewBox={`0 0 ${dim[0]} ${dim[1]}`} className="h-44 w-auto max-w-full" role="img" aria-label="Traced vector preview"><path d={d} className="fill-foreground" shapeRendering="crispEdges" /></svg>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-md border px-3 py-1.5 text-sm hover:border-primary/50">Choose image<input type="file" accept="image/*" hidden onChange={(e) => file(e.target.files?.[0])} /></label>
        <button onClick={sample} className="text-sm text-muted-foreground underline-offset-4 hover:underline">Use sample</button>
        {done && <><Button size="sm" variant="outline" onClick={dl}><Download /> Download this pattern</Button><Button size="sm" asChild><Link href="/signup">Start free trial</Link></Button></>}
      </div>
    </div>
  );
}

/* 6. TURNTABLE: draggable mannequin (stand-in until the Pose Tool turntable assets are wired in) */
export function Turntable() {
  const [a, setA] = useState(0);
  const drag = useRef<number | null>(null), idle = useRef(true);
  useEffect(() => { if (reduced()) return; let raf = 0; const t = () => { if (idle.current) setA((v) => v + 0.012); raf = requestAnimationFrame(t); }; raf = requestAnimationFrame(t); return () => cancelAnimationFrame(raf); }, []);
  const lines = Array.from({ length: 16 }, (_, i) => { const th = a + (i / 16) * Math.PI * 2; return { x: 100 + 46 * Math.sin(th), f: Math.cos(th) }; }).filter((l) => l.f > 0);
  return (
    <div data-glow className="rounded-2xl border bg-card p-5">
      <h3 className="font-semibold">Spin it</h3>
      <p className="mt-1 text-sm text-muted-foreground">Drag to turn the form. Pose Tool gives you every angle for CLO3D.</p>
      <svg viewBox="0 0 200 250" className="mx-auto mt-3 h-56 cursor-grab touch-none select-none active:cursor-grabbing" onPointerDown={(e) => { drag.current = e.clientX; idle.current = false; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={(e) => { if (drag.current !== null) { setA((v) => v + (e.clientX - drag.current!) * 0.02); drag.current = e.clientX; } }} onPointerUp={() => { drag.current = null; idle.current = true; }}>
        <defs><clipPath id="torso"><path d="M72 40 Q100 30 128 40 L136 110 Q128 150 134 200 L66 200 Q72 150 64 110 Z" /></clipPath></defs>
        <ellipse cx="100" cy="228" rx="48" ry="9" className="fill-muted" />
        <rect x="96" y="200" width="8" height="28" className="fill-muted-foreground/50" />
        <circle cx="100" cy="24" r="0" />
        <g clipPath="url(#torso)"><rect x="50" y="30" width="100" height="180" className="fill-primary/15" />
          {lines.map((l, i) => <line key={i} x1={l.x} x2={l.x} y1="30" y2="210" stroke="rgb(217 119 6)" strokeOpacity={0.25 + l.f * 0.6} strokeWidth={1 + l.f * 3} />)}</g>
        <path d="M72 40 Q100 30 128 40 L136 110 Q128 150 134 200 L66 200 Q72 150 64 110 Z" fill="none" className="stroke-foreground/40" />
      </svg>
    </div>
  );
}

/* 3. BEFORE/AFTER: photo -> cutout -> traced parts */
export function BeforeAfter() {
  const [pos, setPos] = useState(50);
  const [mode, setMode] = useState<"cutout" | "traced">("cutout");
  const box = useRef<HTMLDivElement>(null);
  const set = (x: number) => { const r = box.current!.getBoundingClientRect(); setPos(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100))); };
  const Dress = ({ stage }: { stage: "photo" | "cutout" | "traced" }) => (
    <svg viewBox="0 0 200 260" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs><pattern id="chk" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#e5e7eb" /><rect width="6" height="6" fill="#cbd5e1" /><rect x="6" y="6" width="6" height="6" fill="#cbd5e1" /></pattern>
        <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a8a29e" /><stop offset="1" stopColor="#57534e" /></linearGradient></defs>
      <rect width="200" height="260" fill={stage === "photo" ? "url(#wall)" : "url(#chk)"} />
      <path d={DRESS} fill="#b45309" />
      {stage === "traced" && <g fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 3" style={{ animation: "fn-stitch 1.2s linear infinite" }}><path d="M66 70 L134 70" /><path d="M66 70 L60 80 L40 60 L70 20" /><path d="M134 70 L140 80 L160 60 L130 20" /><path d="M64 120 L136 120" /></g>}
    </svg>
  );
  return (
    <div>
      <div ref={box} data-glow className="relative mx-auto aspect-[4/5] max-w-sm touch-none select-none overflow-hidden rounded-2xl border" onPointerMove={(e) => e.buttons === 1 && set(e.clientX)} onPointerDown={(e) => set(e.clientX)}>
        <div className="absolute inset-0"><Dress stage="photo" /></div>
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}><Dress stage={mode} /></div>
        <div className="absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }}><span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-2 py-1 text-xs font-medium text-black shadow">⇆</span></div>
        <span className="absolute left-3 top-3 rounded bg-black/60 px-2 py-0.5 text-xs text-white">Photo</span>
        <span className="absolute right-3 top-3 rounded bg-black/60 px-2 py-0.5 text-xs text-white">{mode === "cutout" ? "Background removed" : "Parts traced"}</span>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {(["cutout", "traced"] as const).map((m) => <Button key={m} size="sm" variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)}>{m === "cutout" ? "Remove background" : "Trace parts"}</Button>)}
      </div>
    </div>
  );
}

/* 4. FABRIC SWAP: hover a swatch to repaint the garment, click to open the product */
export function SwapPlayground() {
  const [i, setI] = useState(0);
  const f = FABRICS[i];
  return (
    <div className="grid items-center gap-8 md:grid-cols-2">
      <div data-glow className="grid place-items-center rounded-2xl border bg-card p-6">
        <svg viewBox="0 0 200 260" className="h-72"><foreignObject width="200" height="260"><div style={{ width: "100%", height: "100%", background: f.css, backgroundSize: "auto", clipPath: `path("${DRESS}")`, transition: "background .25s" }} /></foreignObject></svg>
        <p className="text-sm font-medium" aria-live="polite">{f.name}</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {FABRICS.map((s, k) => (
          <Link key={s.name} href={s.href} onMouseEnter={() => setI(k)} onFocus={() => setI(k)} className={`group aspect-square rounded-xl border-2 transition ${k === i ? "border-primary" : "border-transparent"}`} style={{ background: s.css }} aria-label={`${s.name}: view in shop`} />
        ))}
        <p className="col-span-3 text-sm text-muted-foreground">Hover to try, click to open that fabric in the shop.</p>
      </div>
    </div>
  );
}

/* 8. MARQUEE: slow strip of textures, pauses on hover */
export function FabricMarquee() {
  const row = [...FABRICS, ...FABRICS];
  return (
    <div className="group overflow-hidden border-y bg-muted/30 py-5 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]" aria-label="Fabric textures">
      <div className="flex w-max gap-4 motion-safe:animate-[fn-marquee_40s_linear_infinite] group-hover:[animation-play-state:paused]">
        {row.map((s, k) => <Link key={k} href={s.href} tabIndex={k >= FABRICS.length ? -1 : 0} className="h-24 w-40 shrink-0 rounded-lg border" style={{ background: s.css }} title={s.name} />)}
      </div>
    </div>
  );
}

/* 5. SEAM: dashed line that sews itself as you scroll (desktop) */
export function SeamLine() {
  const ref = useRef<SVGLineElement>(null);
  useEffect(() => {
    const l = ref.current!, p = l.parentElement!.parentElement!;
    const on = () => { const r = p.getBoundingClientRect(), t = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.3))); l.style.clipPath = `inset(0 ${reduced() ? 0 : (1 - t) * 100}% 0 0)`; };
    on(); addEventListener("scroll", on, { passive: true }); return () => removeEventListener("scroll", on);
  }, []);
  return <svg aria-hidden className="absolute left-0 right-0 top-9 hidden h-1 w-full lg:block"><line ref={ref} x1="0" x2="100%" y1="2" y2="2" stroke="rgb(217 119 6)" strokeWidth="2" strokeDasharray="8 6" /></svg>;
}

/* 9. CMD+K */
const ROUTES = [["Shop", "/shop"], ["Garment Tool", "/account/garment-tool"], ["Pose Tool", "/account/pose-tool"], ["Design Patterns", "/design-patterns"], ["Pricing", "/pricing"], ["Developers / API", "/developers"], ["My Purchases", "/account/purchases"], ["Licensing", "/licensing"], ["Help Center", "/help"], ["Contact", "/contact"]];
export function CommandK() {
  const r = useRouter();
  const [open, setOpen] = useState(false), [q, setQ] = useState(""), [sel, setSel] = useState(0);
  useEffect(() => { const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); setQ(""); setSel(0); } if (e.key === "Escape") setOpen(false); }; addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, []);
  const list = ROUTES.filter(([n]) => n.toLowerCase().includes(q.toLowerCase()));
  const go = (h: string) => { setOpen(false); r.push(h); };
  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-4 right-4 z-40 hidden items-center gap-2 rounded-full border bg-card/90 px-3 py-1.5 text-xs text-muted-foreground shadow backdrop-blur hover:text-foreground sm:flex"><Search className="h-3.5 w-3.5" /> Jump to <kbd className="rounded border px-1">⌘K</kbd></button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-start justify-center bg-black/40 p-4 pt-[15vh]" onClick={() => setOpen(false)} role="dialog" aria-modal aria-label="Jump to page">
          <div className="w-full max-w-md overflow-hidden rounded-xl border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setSel(0); }} onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, list.length - 1)); } if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); } if (e.key === "Enter" && list[sel]) go(list[sel][1]); }} placeholder="Where to?" className="w-full border-b bg-transparent px-4 py-3 text-sm outline-none" />
            <ul className="max-h-72 overflow-auto p-1">{list.map(([n, h], k) => <li key={h}><button onMouseEnter={() => setSel(k)} onClick={() => go(h)} className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${k === sel ? "bg-primary/10 text-primary" : ""}`}>{n}<ArrowRight className="h-4 w-4" /></button></li>)}{!list.length && <li className="px-3 py-4 text-sm text-muted-foreground">No match</li>}</ul>
          </div>
        </div>
      )}
    </>
  );
}
