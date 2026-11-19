"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { TeamListing } from "./wilson-listings";
import s from "./fandeck.module.css";

// When the emerald tornado peaks in the background video, the cards burst out.
const TORNADO = 3.6; // seconds

function spread(list: TeamListing[], n: number): TeamListing[] {
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
  const cards = spread(listings, count);
  const bandRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [revealed, setRevealed] = useState(false);

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
            v.play().catch(() => setRevealed(true)); // if autoplay is blocked, still show the cards
            // safety net: reveal even if the video stalls
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

        <div className={`${s.deck} ${revealed ? s.revealed : ""}`}>
          {cards.map((l, i) => (
            <Link key={l.title + i} className={s.card} href={`${baseHref}?area=${encodeURIComponent(l.area)}`}>
              <span className={s.ph}>WOLF GROUP</span>
              {l.image && <img src={l.image} alt={l.title} loading="lazy" />}
              <span className={s.meta}>
                <span className={s.price}>{l.price}</span>
                <span className={s.area}>{l.area}</span>
              </span>
            </Link>
          ))}
        </div>

        <p className={s.hint}>Swipe to browse · tap a card to open its area</p>
        <div className={s.cta}>
          <Link className={s.btn} href={baseHref}>
            View all {listings.length} listings →
          </Link>
        </div>
      </div>
    </div>
  );
}
