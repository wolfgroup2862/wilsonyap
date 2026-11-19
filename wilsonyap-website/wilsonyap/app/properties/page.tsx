import type { Metadata } from "next";
import { PROFILE as WILSON } from "../wilson/profile";
import { WILSON_LISTINGS } from "../_agent/wilson-listings";
import ForSale from "../_agent/ForSale";
import s from "../team/team.module.css";

export const metadata: Metadata = {
  title: { absolute: "For Sale — Commercial Properties | Wilson Yap · Wolf Group" },
  description: "All commercial properties for sale by Wilson Yap — shoplots, offices and shop-offices around Puchong, Bandar Puteri and IOI Boulevard.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/properties" },
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string }>;
}) {
  const { area } = await searchParams;
  return (
    <main className={s.page}>
      <header className={s.nav}>
        <a href="/#top" className={s.brand} aria-label="Wolf Group home">
          <img src="/wolf-group-logo-transparent.png" alt="Wolf Group" width={3050} height={721} />
        </a>
        <nav aria-label="Sections" className={s.links}>
          <a href="/#top">Home</a>
          <a href="/#wilson">My Team</a>
          <a href="/properties">Properties</a>
        </nav>
        <a href="/#contact" className={s.navCta}>
          Get in Touch <span aria-hidden="true">→</span>
        </a>
      </header>

      <section id="properties" className={s.listings} style={{ paddingTop: "clamp(48px,10vw,110px)" }}>
        <p className={s.kicker}>Commercial · For sale · {WILSON_LISTINGS.length} listings</p>
        <h2 className={s.listingsTitle}>
          For Sale<span>.</span>
        </h2>
        <p style={{ color: "#8C765A", maxWidth: "46ch", margin: "0 0 30px", lineHeight: 1.6 }}>
          Every commercial unit Wilson is selling right now — shoplots, offices &amp; shop-offices around
          Puchong, Bandar Puteri &amp; IOI Boulevard. Filter by area, type or price, then WhatsApp to arrange a viewing.
        </p>
        <ForSale listings={WILSON_LISTINGS} whatsapp={WILSON.whatsapp} initialArea={area} />
      </section>

      <section id="contact" className={s.contact}>
        <h2>
          Let&rsquo;s talk <span>property.</span>
        </h2>
        <p>Wilson Yap · The Roof Realty (TRR) · Wolf Group</p>
        <div className={s.actions}>
          <a className={s.btnDark} href="/#wilson">← Back to Wilson</a>
        </div>
      </section>
    </main>
  );
}
