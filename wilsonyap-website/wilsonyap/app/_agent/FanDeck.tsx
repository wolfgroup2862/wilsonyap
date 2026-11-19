import Link from "next/link";
import type { TeamListing } from "./wilson-listings";
import s from "./fandeck.module.css";

// Pick up to `n` listings spread evenly across the list, so the fan shows a
// variety of areas and price points rather than the first few.
function spread(list: TeamListing[], n: number): TeamListing[] {
  if (list.length <= n) return list;
  const out: TeamListing[] = [];
  for (let i = 0; i < n; i++) out.push(list[Math.round((i * (list.length - 1)) / (n - 1))]);
  return out;
}

export default function FanDeck({
  listings,
  baseHref = "/properties",
  count = 7,
}: {
  listings: TeamListing[];
  baseHref?: string;
  count?: number;
}) {
  const cards = spread(listings, count);
  return (
    <div className={s.band}>
      <p className={s.eyebrow}>Wilson Yap · Commercial</p>
      <h2 className={s.title}>
        What&rsquo;s
        <br />
        <span>for sale</span>
      </h2>

      <div className={s.deck}>
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

      <div className={s.cta}>
        <Link className={s.btn} href={baseHref}>
          View all {listings.length} listings →
        </Link>
      </div>
    </div>
  );
}
