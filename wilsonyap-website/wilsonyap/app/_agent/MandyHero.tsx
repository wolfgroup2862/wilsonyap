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

  // full 360° turn, 36 cut-out frames (10° apart)
  const FRAMES = Array.from({ length: 36 }, (_, i) => `/agent/mandy360-${String(i).padStart(2, "0")}.webp`);

  const wa = p.whatsapp
    ? `https://wa.me/${p.whatsapp}?text=${encodeURIComponent(`Hi ${p.firstName}, I found your website and would like to ask about a property.`)}`
    : null;

  useEffect(() => {
    const wrap = wrapRef.current;
    const imgs = imgEls.current.filter(Boolean) as HTMLImageElement[];
    const n = imgs.length;
    if (!wrap || n === 0) return;

    const S = {
      disp: 0, userPos: 0,
      startX: 0, startY: 0, basePos: 0,
      axis: "" as "" | "x" | "y",
      mouseDrag: false,
      raf: 0,
    };
    const widthOf = () => wrap.getBoundingClientRect().width || 360;
    // ~1.5 screen-widths of drag = a full 360° turn; drag RIGHT turns one way,
    // LEFT the other, and it wraps around forever (continuous spin).
    const sens = () => n / (widthOf() * 1.5);
    const mod = (v: number) => ((v % n) + n) % n;

    // cross-fade the two nearest frames (10° apart → always smooth)
    const render = () => {
      const base = mod(S.disp);
      const lo = Math.floor(base) % n;
      const hi = (lo + 1) % n;
      const f = base - Math.floor(base);
      for (let i = 0; i < n; i++) {
        let o = 0;
        if (i === lo) o = 1 - f;
        if (i === hi) o += f;
        imgs[i].style.opacity = String(o);
        imgs[i].style.zIndex = i === hi ? "2" : "1";
      }
    };

    const frame = () => {
      S.disp += (S.userPos - S.disp) * 0.22;
      render();
      S.raf = requestAnimationFrame(frame);
    };

    // TOUCH — own only horizontal drags; vertical scrolls the page
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
        e.preventDefault();
        S.userPos = S.basePos + dx * sens(); // drag right → turn right
      }
    };
    const tEnd = () => {
      S.axis = "";
    };

    // MOUSE (desktop): click-drag to turn — pull right → right, pull left → left
    const mDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      S.mouseDrag = true;
      S.startX = e.clientX;
      S.basePos = S.userPos;
      wrap.setPointerCapture?.(e.pointerId);
    };
    const mMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" || !S.mouseDrag) return;
      S.userPos = S.basePos + (e.clientX - S.startX) * sens();
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
    wrap.addEventListener("pointercancel", mUp);
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
      wrap.removeEventListener("pointercancel", mUp);
    };
  }, []);

  return (
    <section id="mandy" className={h.hero}>
      {/* big billboard name scrolling left → right behind her */}
      <div className={h.marquee} aria-hidden="true">
        <div className={h.mtrack}>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className={h.mword}>
              Mandy Lee&nbsp;&middot;&nbsp;
            </span>
          ))}
        </div>
      </div>

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

      <div className={h.bottombar}>
        {wa && (
          <a className={h.wa} href={wa} target="_blank" rel="noopener noreferrer">
            WhatsApp <span aria-hidden="true">↗</span>
          </a>
        )}
        <div className={h.corner}>
          <span className={h.ckicker}>The Roof Realty · Wolf Group</span>
          <span className={h.careas}>{p.areas.join(" · ")}</span>
        </div>
      </div>
    </section>
  );
}
