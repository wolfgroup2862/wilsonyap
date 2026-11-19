"use client";

import { useEffect } from "react";

// Watches every [data-reveal] element and toggles [data-inview] as it enters or
// leaves the viewport, so sections zoom / slide in on scroll (and replay when
// you scroll back). Respects reduced-motion and old browsers by showing all.
export default function ScrollFX() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((e) => e.setAttribute("data-inview", ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) en.target.setAttribute("data-inview", "");
          else en.target.removeAttribute("data-inview");
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return null;
}
