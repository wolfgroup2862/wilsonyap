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

    const fine = window.matchMedia("(pointer: fine)").matches;

    const S = {
      disp: 0, userPos: 0,
      startX: 0, startY: 0, basePos: 0,
      axis: "" as "" | "x" | "y",
      mouseDrag: false,
      raf: 0,
    };
    const clamp = (v: number) => Math.max(0, Math.min(n - 1, v));
    const widthOf = () => wrap.getBoundingClientRect().width || 360;

    // show only the nearest angle, with a short blend to its neighbour while
    // mid-turn — no permanent two-pose overlap (that looked like flicker).
    const render = () => {
      const lo = Math.floor(S.disp);
      const hi = Math.min(n - 1, lo + 1);
      let f = S.disp - lo;
      // bias toward a single clean frame near the integers
      f = f < 0.15 ? 0 : f > 0.85 ? 1 : (f - 0.15) / 0.7;
      for (let i = 0; i < n; i++) {
        let o = 0;
        if (i === lo) o = 1 - f;
        if (i === hi) o += f;
        imgs[i].style.opacity = String(o);
        imgs[i].style.zIndex = i === hi ? "2" : "1";
      }
    };

    const frame = () => {
      S.disp += (S.userPos - S.disp) * 0.2;
      if (Math.abs(S.userPos - S.disp) < 0.001) S.disp = S.userPos;
      render();
      S.raf = requestAnimationFrame(frame);
    };

    // TOUCH — own only horizontal drags; let vertical scroll the page
    const tStart = (e: TouchEvent) => {
      const t = e.touches[0];
      S.startX = t.clientX;
      S.startY = t.clientY;
      S.basePos = S.userPos;
      S.axis = "";
    };
    const tMove = (e: TouchEvent) => {
      const t = e.touches[0];
      const dx = t.clientX - S.startX;
      const dy = t.clientY - S.startY;
      if (!S.axis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        S.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (S.axis === "x") {
        e.preventDefault(); // we own this gesture → turn, don't scroll
        S.userPos = clamp(S.basePos - dx / (widthOf() * 0.32));
      }
    };
    const tEnd = () => {
      if (S.axis === "x") S.userPos = clamp(Math.round(S.userPos)); // settle on a clean angle
      S.axis = "";
    };

    // MOUSE (desktop): drag to turn, or hover to turn toward the cursor
    const mDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      S.mouseDrag = true;
      S.startX = e.clientX;
      S.basePos = S.userPos;
    };
    const mMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (S.mouseDrag) {
        S.userPos = clamp(S.basePos - (e.clientX - S.startX) / (widthOf() * 0.32));
      } else if (fine) {
        const nx = (e.clientX - wrap.getBoundingClientRect().left) / widthOf();
        S.userPos = clamp(nx * (n - 1));
      }
    };
    const mUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      S.mouseDrag = false;
    };

    wrap.addEventListener("touchstart", tStart, { passive: true });
    wrap.addEventListener("touchmove", tMove, { passive: false });
    wrap.addEventListener("touchend", tEnd);
    wrap.addEventListener("touchcancel", tEnd);
    wrap.addEventListener("pointerdown", mDown);
    wrap.addEventListener("pointermove", mMove);
    wrap.addEventListener("pointerup", mUp);
    S.raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(S.raf);
      wrap.removeEventListener("touchstart", tStart);
      wrap.removeEventListener("touchmove", tMove);
      wrap.removeEventListener("touchend", tEnd);
      wrap.removeEventListener("touchcancel", tEnd);
      wrap.removeEventListener("pointerdown", mDown);
      wrap.removeEventListener("pointermove", mMove);
      wrap.removeEventListener("pointerup", mUp);
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
