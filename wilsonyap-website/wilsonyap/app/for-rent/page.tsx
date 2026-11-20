import type { Metadata } from "next";
import { PROFILE as WILSON } from "../wilson/profile";
import { PROFILE as MANDY } from "../mandy/profile";
import { WILSON_RENT_LISTINGS } from "../_agent/wilson-rent-listings";
import { MANDY_RENT_LISTINGS } from "../_agent/mandy-rent-listings";
import ForRent, { type RentListing } from "../_agent/ForRent";
import s from "../team/team.module.css";

export const metadata: Metadata = {
  title: { absolute: "For Rent — Commercial Properties | Wolf Group · The Roof Realty (TRR)" },
  description: "All commercial properties for rent by Wilson Yap and Mandy Lee — shoplots, offices and shop-offices around Puchong, Bandar Puteri and IOI Boulevard.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/for-rent" },
};

const WILSON_RENT: RentListing[] = WILSON_RENT_LISTINGS.map((l) => ({
  ...l,
  agent: "Wilson",
  whatsapp: WILSON.whatsapp ?? "",
}));
const MANDY_RENT: RentListing[] = MANDY_RENT_LISTINGS.map((l) => ({
  ...l,
  agent: "Mandy",
  whatsapp: MANDY.whatsapp ?? "",
}));

export default async function ForRentPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; agent?: string; view?: string }>;
}) {
  const { area, agent, view } = await searchParams;

  let listings: RentListing[];
  let intro: string;
  if (agent === "wilson") {
    listings = WILSON_RENT;
    intro = "Every commercial unit Wilson Yap is renting out right now";
  } else if (agent === "mandy") {
    listings = MANDY_RENT;
    intro = "Every commercial unit Mandy Lee is renting out right now";
  } else {
    listings = [...WILSON_RENT, ...MANDY_RENT];
    intro = "Every commercial unit Wilson Yap and Mandy Lee are renting out right now";
  }

  return (
    <main className={s.page}>
      <header className={s.nav}>
        <a href="/#top" className={s.brand} aria-label="Wolf Group home">
          <img src="/wolf-group-logo-transparent.png" alt="Wolf Group" width={3050} height={721} />
        </a>
        <nav aria-label="Sections" className={s.links}>
          <a href="/#top">Home</a>
          <a href="/team#wilson">My Team</a>
          <a href="/properties">For Sale</a>
          <a href="/for-rent">For Rent</a>
        </nav>
        <a href="/team#contact" className={s.navCta}>
          Get in Touch <span aria-hidden="true">→</span>
        </a>
      </header>

      <section id="for-rent" className={s.listings} style={{ paddingTop: "clamp(48px,10vw,110px)" }}>
        <p className={s.kicker}>Commercial · For rent · {listings.length} listings</p>
        <h2 className={s.listingsTitle}>
          For Rent<span>.</span>
        </h2>
        <p style={{ color: "#8C765A", maxWidth: "46ch", margin: "0 0 30px", lineHeight: 1.6 }}>
          {intro} — shoplots, offices &amp; shop-offices around Puchong, Bandar Puteri &amp; IOI Boulevard.
          Filter by area, type or price, then WhatsApp to arrange a viewing.
        </p>
        <ForRent
          listings={listings}
          initialArea={area}
          initialView={view}
          shareWhatsapp={WILSON.whatsapp ?? ""}
          shareBase="https://wilsonyap.vercel.app/for-rent"
        />
      </section>

      <section id="contact" className={s.contact}>
        <h2>
          Let&rsquo;s talk <span>property.</span>
        </h2>
        <p>Wolf Group · The Roof Realty (TRR)</p>
        <div className={s.actions}>
          <a className={s.btnDark} href="/team">← Back to the team</a>
        </div>
      </section>
    </main>
  );
}
