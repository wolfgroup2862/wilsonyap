"use client";

import { useEffect, useRef } from "react";
import type { Profile } from "./AgentPage";
import h from "./wilsonhero.module.css";

// Lando-Norris–style hero for Wilson: big head-and-shoulders in the centre, his
// name top-left. Move the mouse onto him and a race helmet flickers and
// assembles onto his head (visor → crown → chin); move away and it drops off.
// The pointer drives --q (assembly 0→1) and --fk (flicker) on the stack; the
// slice CSS does the rest.
export default function WilsonHero({ profile: p }: { profile: Profile }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  const wa = p.whatsapp
    ? `https://wa.me/${p.whatsapp}?text=${encodeURIComponent(`Hi ${p.firstName}, I found your website and would like to ask about a property.`)}`
    : null;

  useEffect(() => {
    const wrap = wrapRef.current;
    const stack = stackRef.current;
    if (!wrap || !stack) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none)").matches;

    const S = { q: 0, target: 0, raf: 0, lastFlick: 0, fk: 1 };

    const frame = (t: number) => {
      // ease assembly toward the target
      S.q += (S.target - S.q) * 0.16;
      if (S.q < 0.001) S.q = 0;

      // flicker: rapid opacity jitter while the helmet is "putting on"/worn
      if (!reduce && S.q > 0.04) {
        if (t - S.lastFlick > 55) {
          const settled = S.q > 0.92 && S.target >= 1;
          const amp = settled ? 0.12 : 0.5; // gentle shimmer once worn, strong glitch mid-assembly
          S.fk = 1 - Math.random() * amp;
          S.lastFlick = t;
        }
      } else {
        S.fk = 1;
      }

      stack.style.setProperty("--q", S.q.toFixed(3));
      stack.style.setProperty("--fk", S.fk.toFixed(3));
      S.raf = requestAnimationFrame(frame);
    };

    const enter = () => (S.target = 1);
    const leave = () => (S.target = 0);

    if (coarse || reduce) {
      // touch / reduced-motion: reveal the helmet when the hero scrolls into view
      const io = new IntersectionObserver(
        (ents) => ents.forEach((e) => (S.target = e.isIntersecting ? 1 : 0)),
        { threshold: 0.5 },
      );
      io.observe(wrap);
      S.raf = requestAnimationFrame(frame);
      return () => {
        io.disconnect();
        cancelAnimationFrame(S.raf);
      };
    }

    wrap.addEventListener("pointerenter", enter);
    wrap.addEventListener("pointermove", enter);
    wrap.addEventListener("pointerleave", leave);
    S.raf = requestAnimationFrame(frame);
    return () => {
      wrap.removeEventListener("pointerenter", enter);
      wrap.removeEventListener("pointermove", enter);
      wrap.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(S.raf);
    };
  }, []);

  return (
    <section id="wilson" className={h.hero}>
      <div className={h.bg} aria-hidden="true" />

      <div className={h.mark}>
        <span className={h.markName}>
          Wilson
          <br />
          Yap
        </span>
        <span className={h.meta}>REN 07483 · The Roof Realty (TRR)</span>
      </div>

      {wa && (
        <a className={h.store} href={wa} target="_blank" rel="noopener noreferrer">
          WhatsApp <span aria-hidden="true">↗</span>
        </a>
      )}

      <div className={h.stage} ref={wrapRef}>
        <figure className={h.portrait}>
          <div className={h.stack} ref={stackRef}>
            <img className={h.base} src="/agent/wilson-half.webp" alt={p.fullName} />
            <img className={`${h.slice} ${h.mid}`} src="/agent/wilson-helmet.webp" alt="" aria-hidden="true" />
            <img className={`${h.slice} ${h.top}`} src="/agent/wilson-helmet.webp" alt="" aria-hidden="true" />
            <img className={`${h.slice} ${h.bot}`} src="/agent/wilson-helmet.webp" alt="" aria-hidden="true" />
          </div>
        </figure>
        <p className={h.hint} aria-hidden="true">Hover Wilson</p>
      </div>

      <div className={h.caption}>
        <h2 className={h.tag}>{p.tagline}</h2>
        <p className={h.areas}>{p.areas.join(" · ")}</p>
        {wa && (
          <a className={h.waBtn} href={wa} target="_blank" rel="noopener noreferrer">
            WhatsApp {p.firstName}
          </a>
        )}
      </div>
    </section>
  );
}
