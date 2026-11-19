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
    const coarse = window.matchMedia("(hover: none)").matches;

    const S = { rx: 0, ry: 0, tx: 0, ty: 0, trx: 0, tryy: 0, raf: 0, t: 0 };
    const MAXY = 16; // deg left/right
    const MAXX = 10; // deg up/down

    const apply = () => {
      tilt.style.transform = `rotateX(${S.rx.toFixed(2)}deg) rotateY(${S.ry.toFixed(2)}deg) translate3d(${S.tx.toFixed(1)}px, ${S.ty.toFixed(1)}px, 0)`;
    };

    const frame = (t: number) => {
      if ((reduce ? false : coarse)) {
        // touch / no pointer: gentle autonomous drift so it still feels 3D
        S.t = t / 1000;
        S.tryy = Math.sin(S.t * 0.6) * MAXY * 0.7;
        S.trx = Math.sin(S.t * 0.45 + 1) * MAXX * 0.5;
      }
      S.ry += (S.tryy - S.ry) * 0.08;
      S.rx += (S.trx - S.rx) * 0.08;
      S.tx += (S.tryy * 0.6 - S.tx) * 0.08;
      S.ty += (-S.trx * 0.5 - S.ty) * 0.08;
      apply();
      S.raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1; // -1..1
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      S.tryy = Math.max(-1, Math.min(1, nx)) * MAXY;
      S.trx = -Math.max(-1, Math.min(1, ny)) * MAXX;
    };
    const onLeave = () => {
      S.tryy = 0;
      S.trx = 0;
    };

    if (!reduce && !coarse) {
      wrap.addEventListener("pointermove", onMove);
      wrap.addEventListener("pointerleave", onLeave);
    }
    if (!reduce) S.raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(S.raf);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
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
        <span className={h.hint} aria-hidden="true">Move to turn</span>
      </div>

      <div className={h.corner}>
        <span className={h.ckicker}>The Roof Realty · Wolf Group</span>
        <span className={h.cname}>Mandy Lee</span>
        <span className={h.careas}>{p.areas.join(" · ")}</span>
      </div>
    </section>
  );
}
