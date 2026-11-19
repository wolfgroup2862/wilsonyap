"use client";

import { useEffect, useRef } from "react";
import type { Profile } from "./AgentPage";
import h from "./mandyhero.module.css";

// Full-page editorial hero for Mandy (prmpt-style): big centred figure, name
// top-left, small labels in the corners. The figure tilts in 3D toward the
// pointer (pseudo-360 head-turn); on touch it drifts gently on its own.
export default function MandyHero({ profile: p }: { profile: Profile }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgEls = useRef<(HTMLImageElement | null)[]>([]);

  const FRAMES = [
    "/agent/mandy-rot-0.webp",
    "/agent/mandy-rot-1.webp",
    "/agent/mandy-rot-2.webp",
    "/agent/mandy-rot-3.webp",
    "/agent/mandy-rot-4.webp",
  ];

  const wa = p.whatsapp
    ? `https://wa.me/${p.whatsapp}?text=${encodeURIComponent(`Hi ${p.firstName}, I found your website and would like to ask about a property.`)}`
    : null;

  useEffect(() => {
    const wrap = wrapRef.current;
    const imgs = imgEls.current.filter(Boolean) as HTMLImageElement[];
    const n = imgs.length;
    if (!wrap || n === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    const S = {
      pos: 0, disp: 0, userPos: 0,
      dragging: false, startX: 0, basePos: 0,
      lastInput: -9999, raf: 0,
    };
    const clamp = (v: number) => Math.max(0, Math.min(n - 1, v));

    const render = () => {
      const lo = Math.floor(S.disp);
      const hi = Math.min(n - 1, lo + 1);
      const f = S.disp - lo;
      for (let i = 0; i < n; i++) {
        let o = 0;
        if (i === lo) o = 1 - f;
        if (i === hi) o += f;
        imgs[i].style.opacity = String(o);
        imgs[i].style.zIndex = i === hi ? "2" : "1";
      }
    };

    const frame = (t: number) => {
      const active = S.dragging || t - S.lastInput < 1200;
      let target: number;
      if (active) {
        target = S.userPos;
      } else if (reduce) {
        target = 0;
      } else {
        // gentle autonomous turn: front → back → front, slowly
        target = ((n - 1) / 2) * (1 - Math.cos((t / 1000) * 0.4));
      }
      S.disp += (target - S.disp) * 0.12;
      render();
      S.raf = requestAnimationFrame(frame);
    };

    // drag / swipe — works for touch and mouse — turns her through the angles
    const down = (e: PointerEvent) => {
      S.dragging = true;
      S.startX = e.clientX;
      S.basePos = S.disp;
      S.userPos = S.disp;
      S.lastInput = performance.now();
      wrap.setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      S.lastInput = performance.now();
      const w = wrap.getBoundingClientRect().width || 360;
      if (S.dragging) {
        // drag across ~1/3 of the width = one angle step
        S.userPos = clamp(S.basePos - ((e.clientX - S.startX) / (w * 0.3)));
      } else if (fine) {
        // desktop hover: map cursor x across the whole rotation
        const nx = (e.clientX - wrap.getBoundingClientRect().left) / w;
        S.userPos = clamp(nx * (n - 1));
      }
    };
    const up = () => {
      S.dragging = false;
      S.lastInput = performance.now();
    };

    wrap.addEventListener("pointerdown", down);
    wrap.addEventListener("pointermove", move);
    wrap.addEventListener("pointerup", up);
    wrap.addEventListener("pointercancel", up);
    S.raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(S.raf);
      wrap.removeEventListener("pointerdown", down);
      wrap.removeEventListener("pointermove", move);
      wrap.removeEventListener("pointerup", up);
      wrap.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <section id="mandy" className={h.hero}>
      <div className={h.topbar}>
        <span className={h.brand}>Mandy Lee</span>
        {wa && (
          <a className={h.menu} href={wa} target="_blank" rel="noopener noreferrer">
            WhatsApp <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>

      <p className={h.blurb}>{p.tagline}</p>

      <div className={h.stage} ref={wrapRef}>
        <div className={h.frames}>
          {FRAMES.map((src, i) => (
            <img
              key={src}
              ref={(el) => {
                imgEls.current[i] = el;
              }}
              className={h.frame}
              src={src}
              alt={i === 0 ? p.fullName : ""}
              aria-hidden={i !== 0}
              draggable={false}
              style={{ opacity: i === 0 ? 1 : 0 }}
            />
          ))}
        </div>
        <span className={h.hint} aria-hidden="true">Drag to turn</span>
      </div>

      <div className={h.corner}>
        <span className={h.ckicker}>The Roof Realty · Wolf Group</span>
        <span className={h.cname}>Mandy Lee</span>
        <span className={h.careas}>{p.areas.join(" · ")}</span>
      </div>
    </section>
  );
}
