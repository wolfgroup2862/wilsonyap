"use client";

import { useEffect, useRef } from "react";
import type { Profile } from "./AgentPage";
import h from "./mandyhero.module.css";

// Full-page editorial hero for Mandy (prmpt-style): big centred figure, name
// top-left, small labels in the corners. The figure tilts in 3D toward the
// pointer (pseudo-360 head-turn); on touch it drifts gently on its own.
export default function MandyHero({ profile: p }: { profile: Profile }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  const wa = p.whatsapp
    ? `https://wa.me/${p.whatsapp}?text=${encodeURIComponent(`Hi ${p.firstName}, I found your website and would like to ask about a property.`)}`
    : null;

  useEffect(() => {
    const wrap = wrapRef.current;
    const tilt = tiltRef.current;
    if (!wrap || !tilt) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    const S = {
      rx: 0, ry: 0, tx: 0, ty: 0, // current (eased)
      trx: 0, tryy: 0, // targets
      dragging: false, startX: 0, startY: 0, baseRY: 0, baseRX: 0,
      lastInput: -9999, raf: 0,
    };
    const MAXY = 20; // hover/sway left-right
    const MAXX = 13; // hover/sway up-down
    const DRAGMAX = 34; // drag can turn further

    const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
    const apply = () => {
      tilt.style.transform = `rotateX(${S.rx.toFixed(2)}deg) rotateY(${S.ry.toFixed(2)}deg) translate3d(${S.tx.toFixed(1)}px, ${S.ty.toFixed(1)}px, 0)`;
    };

    const frame = (t: number) => {
      const idle = !S.dragging && t - S.lastInput > 900;
      if (idle && !reduce) {
        // gentle autonomous turn so it always reads as 3D, even untouched
        const s = t / 1000;
        S.tryy = Math.sin(s * 0.55) * MAXY * 0.85;
        S.trx = Math.sin(s * 0.4 + 1) * MAXX * 0.5;
      }
      S.ry += (S.tryy - S.ry) * 0.09;
      S.rx += (S.trx - S.rx) * 0.09;
      S.tx += (S.ry * 0.9 - S.tx) * 0.09; // parallax drift with the turn
      S.ty += (-S.rx * 0.8 - S.ty) * 0.09;
      apply();
      S.raf = requestAnimationFrame(frame);
    };

    // DRAG — works for touch and mouse: grab the figure and turn it
    const down = (e: PointerEvent) => {
      S.dragging = true;
      S.startX = e.clientX;
      S.startY = e.clientY;
      S.baseRY = S.tryy;
      S.baseRX = S.trx;
      S.lastInput = performance.now();
      wrap.setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      S.lastInput = performance.now();
      if (S.dragging) {
        S.tryy = clamp(S.baseRY + (e.clientX - S.startX) * 0.35, DRAGMAX);
        S.trx = clamp(S.baseRX - (e.clientY - S.startY) * 0.3, DRAGMAX * 0.6);
      } else if (fine) {
        // desktop hover: turn toward the cursor
        const r = wrap.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        S.tryy = clamp(nx, 1) * MAXY;
        S.trx = clamp(-ny, 1) * MAXX;
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
    if (!reduce) S.raf = requestAnimationFrame(frame);
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
        <div className={h.tilt} ref={tiltRef}>
          <img src={p.realImage} alt={p.fullName} draggable={false} />
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
