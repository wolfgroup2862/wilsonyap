import Link from "next/link";
import s from "./areamap.module.css";

export type AreaStat = { name: string; count: number };

// Shorter label shown on the island (the filter still uses the full name).
const SHORT: Record<string, string> = {
  "Taman Puchong Utama": "Puchong Utama",
  "Taman Perindustrian Puchong Utama": "Puchong Utama · Ind.",
};

// A lit gold skyscraper; height varies by index so the cluster reads as a
// small skyline rising from the island.
function Tower({ seed }: { seed: number }) {
  const h = [0, 30, 14, 44, 6][seed % 5];
  const topY = 60 - h;
  const setback = topY + 30;
  const crown = topY - 14;
  const tip = crown - 16;
  return (
    <svg className={s.twSvg} viewBox="0 0 100 200" role="img" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id={`am-tw-${seed}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7a5c18" />
          <stop offset="0.5" stopColor="#f4e1a0" />
          <stop offset="1" stopColor="#7a5c18" />
        </linearGradient>
        <pattern id={`am-win-${seed}`} width="12" height="14" patternUnits="userSpaceOnUse">
          <rect x="3" y="3" width="6" height="6" fill="#fff7d8" opacity="0.7" />
        </pattern>
      </defs>
      {/* wider base + slim upper tier = a proper tower, not a spike */}
      <rect x="30" y={setback} width="40" height={192 - setback} fill={`url(#am-tw-${seed})`} />
      <rect x="38" y={topY} width="24" height={setback - topY + 2} fill={`url(#am-tw-${seed})`} />
      <rect x="33" y={setback + 4} width="34" height={186 - setback} fill={`url(#am-win-${seed})`} opacity="0.8" />
      <rect x="41" y={topY + 4} width="18" height={setback - topY} fill={`url(#am-win-${seed})`} opacity="0.8" />
      {/* crown + antenna */}
      <path d={`M43 ${topY} L50 ${crown} L57 ${topY} Z`} fill="#f4e1a0" />
      <rect x="49" y={tip} width="2" height={crown - tip} fill="#f4e1a0" />
      <circle cx="50" cy={tip} r="2.4" fill="#ffe8a4" />
    </svg>
  );
}

export default function AreaMap({ areas, baseHref = "/properties" }: { areas: AreaStat[]; baseHref?: string }) {
  return (
    <div className={s.band}>
      <div className={s.head}>
        <p className={s.eyebrow}>Commercial · For sale</p>
        <h2 className={s.title}>
          Where Wilson <span>works.</span>
        </h2>
        <p className={s.hint}>Tap an area to explore its listings</p>
      </div>

      <div className={s.stage}>
        {/* backdrop: glow, ghost wordmark, emerald ribbon, far clouds */}
        <svg className={s.scene} viewBox="0 0 1200 620" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <radialGradient id="am-glow" cx="0.5" cy="0.4" r="0.6">
              <stop offset="0" stopColor="#4fae7e" stopOpacity="0.4" />
              <stop offset="1" stopColor="#4fae7e" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="am-ribbon" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#1f8f6a" stopOpacity="0" />
              <stop offset="0.45" stopColor="#5fe3a8" stopOpacity="0.9" />
              <stop offset="0.78" stopColor="#f3dd94" stopOpacity="0.9" />
              <stop offset="1" stopColor="#f3dd94" stopOpacity="0" />
            </linearGradient>
            <filter id="am-blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" /></filter>
            <filter id="am-blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20" /></filter>
          </defs>
          <rect width="1200" height="620" fill="url(#am-glow)" />
          <text x="600" y="330" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="140" letterSpacing="12" fill="#8fd7b0" opacity="0.1">WILSON YAP</text>
          <path d="M-60 400 C 240 250, 380 250, 580 330 S 980 420, 1260 250" fill="none" stroke="url(#am-ribbon)" strokeWidth="26" strokeLinecap="round" filter="url(#am-blur)" opacity="0.85" />
          <path d="M-60 400 C 240 250, 380 250, 580 330 S 980 420, 1260 250" fill="none" stroke="#eafff4" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
          <g fill="#ffe9a8">
            <circle cx="320" cy="283" r="3" opacity="0.9" /><circle cx="500" cy="296" r="2.2" opacity="0.8" /><circle cx="760" cy="360" r="2.6" opacity="0.8" /><circle cx="980" cy="352" r="3" opacity="0.9" />
          </g>
        </svg>

        {/* centred floating island + the clickable towers that stand on it */}
        <div className={s.island}>
          <svg className={s.islandSvg} viewBox="0 0 600 440" aria-hidden="true">
            <defs>
              <radialGradient id="am-top" cx="0.5" cy="0.3" r="0.8">
                <stop offset="0" stopColor="#fff6df" />
                <stop offset="0.6" stopColor="#f0dca0" />
                <stop offset="1" stopColor="#c9a24c" />
              </radialGradient>
              <linearGradient id="am-tier" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ecd596" />
                <stop offset="1" stopColor="#9c7a2e" />
              </linearGradient>
              <linearGradient id="am-ped" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#c7a24a" />
                <stop offset="1" stopColor="#6b5422" stopOpacity="0" />
              </linearGradient>
              <filter id="am-cloud" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
            </defs>
            {/* pedestal tapering down into cloud */}
            <path d="M190 250 Q300 430 410 250 Q355 300 300 304 Q245 300 190 250 Z" fill="url(#am-ped)" />
            {/* tiers */}
            <ellipse cx="300" cy="238" rx="250" ry="48" fill="url(#am-tier)" />
            <ellipse cx="300" cy="238" rx="250" ry="48" fill="#000" opacity="0.12" />
            <ellipse cx="300" cy="210" rx="205" ry="40" fill="url(#am-tier)" />
            <ellipse cx="300" cy="186" rx="165" ry="33" fill="url(#am-tier)" />
            {/* flat gold top where towers stand */}
            <ellipse cx="300" cy="168" rx="150" ry="28" fill="url(#am-top)" />
            <ellipse cx="300" cy="168" rx="150" ry="28" fill="none" stroke="#fff3cf" strokeWidth="1.5" opacity="0.7" />
            <path d="M58 238 A250 48 0 0 0 542 238" fill="none" stroke="#fff0c0" strokeWidth="2" opacity="0.45" />
            {/* near clouds hugging the base */}
            <g fill="#f6f8f3">
              <ellipse cx="170" cy="300" rx="120" ry="34" opacity="0.5" filter="url(#am-cloud)" />
              <ellipse cx="430" cy="300" rx="120" ry="34" opacity="0.5" filter="url(#am-cloud)" />
              <ellipse cx="300" cy="330" rx="150" ry="40" opacity="0.55" filter="url(#am-cloud)" />
            </g>
          </svg>

          <div className={s.towers}>
            {areas.map((a, i) => (
              <Link key={a.name} className={s.tower} href={`${baseHref}?area=${encodeURIComponent(a.name)}`}>
                <Tower seed={i} />
                <span className={s.chip}>
                  <span className={s.area}>{SHORT[a.name] ?? a.name}</span>
                  <span className={s.count}>{a.count} {a.count === 1 ? "listing" : "listings"}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <p className={s.foot}>
        {areas.length} {areas.length === 1 ? "area" : "areas"} · all commercial · <Link href={baseHref}>See every listing →</Link>
      </p>
    </div>
  );
}
