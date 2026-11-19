import type { Profile } from "./AgentPage";
import h from "./wilsonhero.module.css";

// Lando-Norris–style full-screen intro for Wilson: a large centred cut-out that
// morphs (suit → field gear) as you scroll. Relies on ScrollFX (already on the
// page) to drive --p on [data-zoom-scroll] and the [data-morph] overlay.
export default function WilsonHero({ profile: p }: { profile: Profile }) {
  const wa = p.whatsapp
    ? `https://wa.me/${p.whatsapp}?text=${encodeURIComponent(`Hi ${p.firstName}, I found your website and would like to ask about a property.`)}`
    : null;

  return (
    <section id="wilson" className={h.hero} data-reveal="up">
      <svg className={h.bg} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke="#c9b48c" strokeWidth="1.5">
          <path d="M-60 240 C 300 120 520 360 760 300 S 1200 120 1520 320" opacity="0.5" />
          <path d="M-60 430 C 320 320 560 560 820 470 S 1240 300 1520 500" opacity="0.4" />
          <ellipse cx="1120" cy="250" rx="240" ry="150" opacity="0.35" />
          <ellipse cx="300" cy="640" rx="300" ry="190" opacity="0.3" />
        </g>
      </svg>

      <div className={h.markWrap}>
        <div className={h.mark} aria-hidden="true">
          Wilson
          <br />
          Yap
        </div>
        <p className={h.meta}>REN 07483 · The Roof Realty (TRR)</p>
      </div>
      {wa && (
        <a className={h.store} href={wa} target="_blank" rel="noopener noreferrer">
          WhatsApp ↗
        </a>
      )}

      <figure className={h.portrait} data-zoom-scroll>
        <img className={h.rider} src={p.heroImage ?? p.realImage} alt={p.fullName} />
      </figure>

      <div className={h.caption}>
        <h2 className={h.tag}>{p.tagline}</h2>
        <p className={h.areas}>{p.areas.join(" · ")}</p>
        <div className={h.cta}>
          {wa && (
            <a className={h.waBtn} href={wa} target="_blank" rel="noopener noreferrer">
              WhatsApp {p.firstName}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
