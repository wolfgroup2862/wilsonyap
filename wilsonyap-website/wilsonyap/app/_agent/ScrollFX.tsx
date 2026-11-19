"use client";

import { useEffect } from "react";

// Two scroll effects, both JS-driven so they work on every browser (incl. iOS):
//  1. [data-reveal]  — zoom / slide in as the element enters the viewport
//     (replays when scrolled back), via IntersectionObserver + CSS transitions.
//  2. [data-zoom-scroll] — the photo is scrubbed to scroll: --p goes 0→1 as the
//     element travels up through the viewport; CSS scales/parallaxes it.
export default function ScrollFX() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 1. reveal on enter
    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    let io: IntersectionObserver | null = null;
    if (reduce || !("IntersectionObserver" in window)) {
      reveals.forEach((e) => e.setAttribute("data-inview", ""));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          for (const en of entries) {
            if (en.isIntersecting) en.target.setAttribute("data-inview", "");
            else en.target.removeAttribute("data-inview");
          }
        },
        { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
      );
      reveals.forEach((e) => io!.observe(e));
    }

    // 2. scroll-scrubbed photo zoom
    const zoomers = Array.from(document.querySelectorAll<HTMLElement>("[data-zoom-scroll]"));
    let raf = 0;
    const update = () => {
      const vh = window.innerHeight || 1;
      for (const el of zoomers) {
        const r = el.getBoundingClientRect();
        // 0 when the element's top sits at the bottom of the screen,
        // 1 when its bottom has risen to the top of the screen.
        const p = (vh - r.top) / (vh + r.height);
        el.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(4));
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    if (!reduce && zoomers.length) {
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    }

    return () => {
      io?.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return null;
}
