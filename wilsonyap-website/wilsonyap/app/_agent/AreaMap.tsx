import Link from "next/link";
import s from "./areamap.module.css";

export type AreaStat = { name: string; count: number };

// A lit commercial tower, gold on dark. Height varies a little by index so the
// skyline reads as several distinct buildings rising from the map.
function Tower({ seed }: { seed: number }) {
  const h = 150 + (seed % 3) * 34; // 150 / 184 / 218
  const topY = 230 - h;
  const antenna = topY - 26;
  return (
    <svg viewBox="0 0 120 240" role="img" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id={`tw-g-${seed}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a6a1e" />
          <stop offset="0.5" stopColor="#f3dd94" />
          <stop offset="1" stopColor="#8a6a1e" />
        </linearGradient>
        <pattern id={`tw-win-${seed}`} width="12" height="16" patternUnits="userSpaceOnUse">
          <rect x="3" y="4" width="6" height="7" fill="#fff6d2" opacity="0.65" />
        </pattern>
      </defs>
      {/* body: gently tapered tower */}
      <path
        d={`M40 230 L${44} ${topY + 18} L54 ${topY} L66 ${topY} L76 ${topY + 18} L80 230 Z`}
        fill={`url(#tw-g-${seed})`}
      />
      {/* lit windows */}
      <rect x="46" y={topY + 20} width="28" height={h - 30} fill={`url(#tw-win-${seed})`} opacity="0.85" />
      {/* vertical mullions */}
      <path d={`M54 ${topY + 4} L52 230 M60 ${topY} L60 230 M66 ${topY + 4} L68 230`} stroke="#fff6d2" strokeWidth="0.8" opacity="0.4" fill="none" />
      {/* crown + antenna */}
      <path d={`M54 ${topY} L60 ${topY - 14} L66 ${topY} Z`} fill="#f3dd94" />
      <rect x="59" y={antenna} width="2" height={topY - 14 - antenna} fill="#f3dd94" />
      <circle cx="60" cy={antenna} r="2.6" fill="#ffe7a0" />
    </svg>
  );
}

export default function AreaMap({ areas, baseHref = "/properties" }: { areas: AreaStat[]; baseHref?: string }) {
  return (
    <div className={s.band}>
      {/* faint peninsular-Malaysia silhouette behind the towers */}
      <svg className={s.map} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <linearGradient id="am-land" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1f8f6a" stopOpacity="0.4" />
            <stop offset="1" stopColor="#d9b85a" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <path
          d="M196 44 C214 40 226 54 232 74 C240 100 262 112 268 136 C274 160 262 182 250 206 C240 226 236 252 222 266 C212 276 204 262 200 246 C196 232 188 232 184 218 C178 198 186 180 182 160 C178 140 164 132 162 112 C160 92 170 76 178 62 C184 52 188 46 196 44 Z"
          fill="url(#am-land)"
          stroke="#d9b85a"
          strokeOpacity="0.35"
          strokeWidth="1.2"
        />
      </svg>

      <div className={s.inner}>
        <div className={s.head}>
          <p className={s.eyebrow}>Commercial · For sale</p>
          <h2 className={s.title}>
            Where Wilson <span>works.</span>
          </h2>
          <p className={s.hint}>Tap an area to explore its listings ↓</p>
        </div>

        <div className={s.row}>
          {areas.map((a, i) => (
            <Link key={a.name} className={s.tower} href={`${baseHref}?area=${encodeURIComponent(a.name)}`}>
              <div className={s.svgWrap}>
                <span className={s.base} />
                <Tower seed={i} />
              </div>
              <div className={s.label}>
                <div className={s.area}>{a.name}</div>
                <span className={s.count}>{a.count} {a.count === 1 ? "listing" : "listings"}</span>
                <span className={s.go}>View listings →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className={s.clouds} aria-hidden="true" />
    </div>
  );
}
