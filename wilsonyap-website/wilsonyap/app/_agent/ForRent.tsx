"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { TeamListing } from "./wilson-listings";
import s from "./forsale.module.css";

// A rent listing also carries which agent it belongs to, so each card's
// WhatsApp button reaches the right person (Wilson or Mandy).
export type RentListing = TeamListing & { agent: string; whatsapp: string };

const WA_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.82 9.82 0 001.588 5.317l-.999 3.648 3.9-.864zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

// monthly rent bands
const PRICE_BANDS: { label: string; min: number; max: number }[] = [
  { label: "Under RM 3,000/mo", min: 0, max: 3_000 },
  { label: "RM 3,000 – 6,000/mo", min: 3_000, max: 6_000 },
  { label: "RM 6,000 – 10,000/mo", min: 6_000, max: 10_000 },
  { label: "Above RM 10,000/mo", min: 10_000, max: Infinity },
];

function waLink(l: RentListing) {
  const text = `Hi ${l.agent}, I'm interested in renting this listing: ${l.title} (${l.price}) at ${l.location}. Is it still available?`;
  return `https://wa.me/${l.whatsapp}?text=${encodeURIComponent(text)}`;
}

export default function ForRent({
  listings,
  limit,
  viewAllHref,
  initialArea,
}: {
  listings: RentListing[];
  limit?: number;
  viewAllHref?: string;
  initialArea?: string;
}) {
  const [area, setArea] = useState(
    initialArea && listings.some((l) => l.area === initialArea) ? initialArea : "",
  );
  const [type, setType] = useState("");
  const [band, setBand] = useState("");
  const [open, setOpen] = useState<RentListing | null>(null);

  const areas = useMemo(() => [...new Set(listings.map((l) => l.area))].sort(), [listings]);
  const types = useMemo(() => [...new Set(listings.map((l) => l.type))].sort(), [listings]);

  const filtered = useMemo(() => {
    const pb = PRICE_BANDS.find((b) => b.label === band);
    return listings.filter(
      (l) =>
        (!area || l.area === area) &&
        (!type || l.type === type) &&
        (!pb || (l.priceValue >= pb.min && l.priceValue < pb.max)),
    );
  }, [listings, area, type, band]);

  const active = Boolean(area || type || band);
  const cap = limit ?? filtered.length;
  const vis = filtered.slice(0, cap);
  const hasMore = viewAllHref ? filtered.length > vis.length : false;

  return (
    <div className={s.wrap}>
      <div className={s.filters}>
        <div className={s.fgroup}>
          <label htmlFor="frArea">Area</label>
          <select id="frArea" value={area} onChange={(e) => setArea(e.target.value)}>
            <option value="">All areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className={s.fgroup}>
          <label htmlFor="frType">Property type</label>
          <select id="frType" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className={s.fgroup}>
          <label htmlFor="frPrice">Monthly rent</label>
          <select id="frPrice" value={band} onChange={(e) => setBand(e.target.value)}>
            <option value="">Any price</option>
            {PRICE_BANDS.map((b) => (
              <option key={b.label} value={b.label}>{b.label}</option>
            ))}
          </select>
        </div>
        <button className={s.reset} type="button" onClick={() => { setArea(""); setType(""); setBand(""); }}>
          Reset
        </button>
      </div>

      <div className={s.grid}>
        {vis.length === 0 && <div className={s.empty}>No listings match these filters — try another combination.</div>}
        {vis.map((l, i) => (
          <article key={l.title + i} className={s.card}>
            <div className={s.chead}>
              <span className={s.num}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <span className={s.forsale}>For Rent</span>
                <span className={s.ptype}>{l.type}</span>
              </div>
            </div>
            <div className={s.imgwrap}>
              <span className={s.ph}>WOLF GROUP</span>
              {l.image && <img src={l.image} alt={l.title} loading="lazy" />}
              <div className={s.price}>{l.price}</div>
            </div>
            <div className={s.cbody}>
              <p className={s.ctitle}>{l.title}</p>
              <p className={s.cloc}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
                </svg>
                {l.location}
              </p>
              <div className={s.specs}>
                {l.builtUp && <span><b>{l.builtUp}</b> built-up</span>}
                {l.psf && <span>{l.psf}</span>}
              </div>
              {l.notes && l.notes.length > 0 && <p className={s.tags}>{l.notes.join(" · ")}</p>}
            </div>
            <div className={s.acts}>
              <a className={`${s.btn} ${s.wa}`} href={waLink(l)} target="_blank" rel="noopener noreferrer">
                {WA_ICON}WhatsApp
              </a>
              <button className={`${s.btn} ${s.det}`} type="button" onClick={() => setOpen(l)}>
                Details
              </button>
            </div>
          </article>
        ))}
      </div>

      {hasMore && viewAllHref && (
        <>
          <div className={s.more}>
            <Link className={s.moreBtn} href={viewAllHref}>
              View all {filtered.length} listings &nbsp;→
            </Link>
          </div>
          <p className={s.count}>Showing {vis.length} of {filtered.length}{active ? " matching" : ""} listings</p>
        </>
      )}
      {!viewAllHref && (
        <p className={s.count}>{filtered.length} {active ? "matching" : "commercial"} listings for rent</p>
      )}

      {open && (
        <>
          <div className={s.scrim} onClick={() => setOpen(null)} />
          <div className={s.modal} role="dialog" aria-modal="true" aria-label={open.title}>
            <button className={s.mclose} type="button" aria-label="Close" onClick={() => setOpen(null)}>✕</button>
            {open.image && <img className={s.mimg} src={open.image} alt={open.title} />}
            <div className={s.mbody}>
              <span className={s.forsale}>For Rent · {open.type}</span>
              <h3 className={s.mtitle}>{open.title}</h3>
              <p className={s.mprice}>{open.price}</p>
              <dl className={s.mrow}>
                <dt>Location</dt><dd>{open.location}</dd>
                {open.builtUp && (<><dt>Built-up</dt><dd>{open.builtUp}</dd></>)}
                {open.land && (<><dt>Land</dt><dd>{open.land}</dd></>)}
                {open.psf && (<><dt>Price / sf</dt><dd>{open.psf}</dd></>)}
                <dt>Type</dt><dd>{open.type}</dd>
                {open.tenure && (<><dt>Tenure</dt><dd>{open.tenure}</dd></>)}
                {open.notes && open.notes.length > 0 && (<><dt>Highlights</dt><dd>{open.notes.join(" · ")}</dd></>)}
              </dl>
              <a className={`${s.btn} ${s.wa}`} href={waLink(open)} target="_blank" rel="noopener noreferrer">
                {WA_ICON}WhatsApp {open.agent} to view
              </a>
              <p className={s.disc}>Details are indicative. Confirm current price, size &amp; availability with {open.agent} before viewing.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
