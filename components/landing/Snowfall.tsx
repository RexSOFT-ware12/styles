"use client";

import { useSeason } from "@/lib/useSeason";
import { useEffect, useRef, useState } from "react";

/**
 * Gentle falling snow over the landing page while the admin has snow switched on.
 * Canvas, pointer-events none (never blocks clicks), paused when the tab is
 * hidden, and skipped entirely for people who prefer reduced motion.
 */
export default function Snowfall() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { snow } = useSeason();
  const [reduce, setReduce] = useState(true);
  useEffect(() => setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  const on = snow && !reduce;

  useEffect(() => {
    if (!on) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0, h = 0, raf = 0, t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const count = Math.round(Math.min(140, Math.max(50, (w * h) / 14000)));
    const flakes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1.4 + Math.random() * 2.8,
      v: 0.4 + Math.random() * 1.1,
      drift: Math.random() * Math.PI * 2,
    }));

    const frame = () => {
      t += 0.01;
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.y += f.v;
        f.x += Math.sin(t + f.drift) * 0.4;
        if (f.y > h + 5) { f.y = -5; f.x = Math.random() * w; }
        if (f.x > w + 5) f.x = -5;
        if (f.x < -5) f.x = w + 5;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        // White flakes with a faint blue edge stay visible on light and dark pages.
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.shadowColor = "rgba(70,110,190,0.85)";
        ctx.shadowBlur = 4;
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [on]);

  if (!on) return null;
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45]" />;
}
