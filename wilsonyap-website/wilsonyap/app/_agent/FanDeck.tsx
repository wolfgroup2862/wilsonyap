"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { TeamListing } from "./wilson-listings";
import s from "./fandeck.module.css";

// When the emerald tornado peaks in the background video, the cards burst out.
const TORNADO = 3.6; // seconds

function pick(list: TeamListing[], n: number): TeamListing[] {
  if (list.length <= n) return list;
  const out: TeamListing[] = [];
  for (let i = 0; i < n; i++) out.push(list[Math.round((i * (list.length - 1)) / (n - 1))]);
  return out;
}

export default function FanDeck({
  listings,
  baseHref = "/properties",
  count = 10,
}: {
  listings: TeamListing[];
  baseHref?: string;
  count?: number;
}) {
  const cards = pick(listings, count);
  const bandRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardEls = useRef<(HTMLAnchorElement | null)[]>([]);
  const [revealed, setRevealed] = useState(false);

  // reveal the fan when the tornado peaks (or on fallbacks)
  useEffect(() => {
    const band = bandRef.current;
    const v = videoRef.current;
    if (!band) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !v) {
      setRevealed(true);
      return;
    }
    let fallback = 0;
    const onTime = () => {
      if (v.currentTime >= TORNADO) setRevealed(true);
    };
    v.addEventListener("timeupdate", onTime);
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            v.play().catch(() => setRevealed(true));
            if (!fallback) fallback = window.setTimeout(() => setRevealed(true), 4600);
          } else {
            v.pause();
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(band);
    return () => {
      io.disconnect();
      v.removeEventListener("timeupdate", onTime);
      if (fallback) clearTimeout(fallback);
    };
  }, []);

  // swipeable fan: drag / swipe left-right spins the fan so other cards come to
  // the front. The cards keep the fan arrangement — only the centre changes.
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    const n = cards.length;
    const mid = (n - 1) / 2;

    const st = {
      center: mid, // target centre index (snapped)
      disp: mid, // displayed centre (eased)
      spread: 0, // 0 = stacked in the tornado, 1 = full fan
      targetSpread: revealed ? 1 : 0,
      dragging: false,
      startX: 0,
      base: mid,
      moved: 0,
      raf: 0,
    };

    const layout = () => {
      const w = deck.clientWidth || 360;
      const sx = w * 0.135; // horizontal spacing between cards
      const lift = Math.min(70, Math.max(16, w * 0.05)); // outer cards arc downward
      const ang = 7; // degrees per step
      for (let i = 0; i < n; i++) {
        const el = cardEls.current[i];
        if (!el) continue;
        const d = i - st.disp;
        const ad = Math.abs(d);
        const sp = st.spread;
        const tx = d * sx * sp;
        const ty = ad * lift * sp;
        const rot = d * ang * sp;
        const fanScale = Math.max(0.6, 1 - ad * 0.09);
        const sc = 0.42 + (fanScale - 0.42) * sp;
        const vis = ad > 4.6 ? 0 : 1;
        el.style.transform = `translate(-50%, 0) translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg) scale(${sc})`;
        el.style.opacity = String(vis * sp);
        el.style.zIndex = String(60 - Math.round(ad * 10));
        el.style.pointerEvents = vis ? "auto" : "none";
      }
    };

    const frame = () => {
      st.targetSpread = revealed ? 1 : 0;
      st.spread += (st.targetSpread - st.spread) * 0.12;
      if (!st.dragging) st.disp += (st.center - st.disp) * 0.18;
      layout();
      st.raf = requestAnimationFrame(frame);
    };

    const clamp = (v: number) => Math.max(0, Math.min(n - 1, v));
    const spacing = () => (deck.clientWidth || 360) * 0.135;

    const down = (e: PointerEvent) => {
      st.dragging = true;
      st.startX = e.clientX;
      st.base = st.disp;
      st.moved = 0;
      deck.setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!st.dragging) return;
      const dx = e.clientX - st.startX;
      st.moved = Math.max(st.moved, Math.abs(dx));
      st.disp = clamp(st.base - dx / spacing());
    };
    const up = () => {
      if (!st.dragging) return;
      st.dragging = false;
      st.center = clamp(Math.round(st.disp));
    };
    // a drag shouldn't also open a card
    const click = (e: MouseEvent) => {
      if (st.moved > 8) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    deck.addEventListener("pointerdown", down);
    deck.addEventListener("pointermove", move);
    deck.addEventListener("pointerup", up);
    deck.addEventListener("pointercancel", up);
    deck.addEventListener("click", click, true);
    st.raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(st.raf);
      deck.removeEventListener("pointerdown", down);
      deck.removeEventListener("pointermove", move);
      deck.removeEventListener("pointerup", up);
      deck.removeEventListener("pointercancel", up);
      deck.removeEventListener("click", click, true);
    };
  }, [cards.length, revealed]);

  return (
    <div className={s.band} ref={bandRef}>
      <video
        ref={videoRef}
        className={s.bgVideo}
        src="/agent/properties-bg.mp4"
        poster="/agent/properties-bg-poster.jpg"
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className={s.scrim} />

      <div className={s.inner}>
        <p className={s.eyebrow}>Wilson Yap · Commercial</p>
        <h2 className={s.title}>
          What&rsquo;s
          <br />
          <span>for sale</span>
        </h2>

        <div className={`${s.deck} ${revealed ? s.revealed : ""}`} ref={deckRef}>
          {cards.map((l, i) => (
            <Link
              key={l.title + i}
              ref={(el) => {
                cardEls.current[i] = el;
              }}
              className={s.card}
              href={`${baseHref}?area=${encodeURIComponent(l.area)}`}
              draggable={false}
            >
              <span className={s.ph}>WOLF GROUP</span>
              {l.image && <img src={l.image} alt={l.title} loading="lazy" draggable={false} />}
              <span className={s.meta}>
                <span className={s.price}>{l.price}</span>
                <span className={s.area}>{l.area}</span>
              </span>
            </Link>
          ))}
        </div>

        <p className={s.hint}>Swipe to spin the fan · tap a card to open its area</p>
        <div className={s.cta}>
          <Link className={s.btn} href={baseHref}>
            View all {listings.length} listings →
          </Link>
        </div>
      </div>
    </div>
  );
}
