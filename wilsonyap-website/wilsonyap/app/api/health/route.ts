import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ===== Wilson Yap CRM — server-side health check =====
// Runs ONLY on the Vercel server. Uses the Supabase secret key from an env var
// (never shipped to the browser, never in the repo). Returns a data-quality
// summary as JSON. NEVER returns owner IC numbers or phone numbers.

const FOR_OK = new Set(["Sale", "Rent", "Own Stay", "Tenanted", "Sold"]);
const STATUS_OK = new Set(["Available", "Under negotiation", "Sold", "Rented", "Own stay"]);

type Row = { id: string; data: Record<string, unknown>; created_at?: string; updated_at?: string };

function norm(s: unknown): string {
  return String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

async function fetchAll(url: string, key: string): Promise<Row[]> {
  const all: Row[] = [];
  const size = 1000;
  for (let from = 0; ; from += size) {
    const res = await fetch(
      `${url}/rest/v1/listings?select=id,data,created_at,updated_at&order=id&limit=${size}&offset=${from}`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!res.ok) throw new Error(`supabase ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const page = (await res.json()) as Row[];
    all.push(...page);
    if (page.length < size) break;
    if (from > 200000) break; // hard safety cap
  }
  return all;
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || "";
  const expected = process.env.HEALTH_TOKEN || "";
  // Always return HTTP 200 and put the real state inside the JSON, so monitoring
  // tools (WebFetch) can always read the body even on an error condition.
  if (!expected || token !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" });
  }

  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SECRET || "";
  if (!url || !key) {
    return NextResponse.json({
      ok: false,
      error: "missing_env",
      detail: "Set SUPABASE_URL, SUPABASE_SECRET and HEALTH_TOKEN in Vercel project env vars, then redeploy.",
    });
  }

  let rows: Row[];
  try {
    rows = await fetchAll(url, key);
  } catch (e) {
    return NextResponse.json({ ok: false, error: "db_unreachable", detail: String(e).slice(0, 300) });
  }

  const now = Date.now();
  const DAY = 86400000;
  const issues = {
    missing_address: [] as string[],
    unclassified: [] as string[], // no project AND no area
    invalid_for: [] as string[],
    invalid_status: [] as string[],
    bad_owners: [] as string[], // owners present but malformed / owner without a name
  };
  const dupMap = new Map<string, string[]>(); // key -> ids
  let created24 = 0,
    updated24 = 0,
    noOwners = 0;

  for (const r of rows) {
    const d = r.data || {};
    const addr = String((d as Record<string, unknown>).address ?? "").trim();
    const project = String((d as Record<string, unknown>).project ?? "").trim();
    const area = String((d as Record<string, unknown>).area ?? "").trim();
    const forv = String((d as Record<string, unknown>).for ?? "").trim();
    const status = String((d as Record<string, unknown>).status ?? "").trim();
    const owners = (d as Record<string, unknown>).owners;

    if (!addr) issues.missing_address.push(r.id);
    if (!project && !area) issues.unclassified.push(r.id);
    if (forv && !FOR_OK.has(forv)) issues.invalid_for.push(r.id);
    if (status && !STATUS_OK.has(status)) issues.invalid_status.push(r.id);

    if (owners !== undefined && owners !== null) {
      if (!Array.isArray(owners)) issues.bad_owners.push(r.id);
      else {
        if (owners.length === 0) noOwners++;
        else if (owners.some((o) => !o || typeof o !== "object" || !String((o as Record<string, unknown>).name ?? "").trim()))
          issues.bad_owners.push(r.id);
      }
    } else {
      noOwners++;
    }

    if (addr) {
      const k = norm(addr) + "|" + norm(project || area);
      const arr = dupMap.get(k);
      if (arr) arr.push(r.id);
      else dupMap.set(k, [r.id]);
    }

    if (r.created_at && now - Date.parse(r.created_at) < DAY) created24++;
    if (r.updated_at && now - Date.parse(r.updated_at) < DAY) updated24++;
  }

  const dupGroups = [...dupMap.values()].filter((a) => a.length > 1);
  const dupExamples = dupGroups.slice(0, 15).map((a) => a.length + "× " + a[0]);

  const problem_count =
    issues.missing_address.length +
    issues.unclassified.length +
    issues.invalid_for.length +
    issues.invalid_status.length +
    issues.bad_owners.length +
    dupGroups.length;

  return NextResponse.json({
    ok: true,
    checked_at: new Date().toISOString(),
    total: rows.length,
    recent: { created_last_24h: created24, updated_last_24h: updated24 },
    problem_count,
    issues: {
      missing_address: issues.missing_address.length,
      unclassified_no_project_or_area: issues.unclassified.length,
      invalid_for_value: issues.invalid_for.length,
      invalid_status_value: issues.invalid_status.length,
      malformed_owners: issues.bad_owners.length,
      no_owners: noOwners,
      duplicate_address_groups: dupGroups.length,
    },
    samples: {
      missing_address_ids: issues.missing_address.slice(0, 15),
      unclassified_ids: issues.unclassified.slice(0, 15),
      invalid_for_ids: issues.invalid_for.slice(0, 15),
      invalid_status_ids: issues.invalid_status.slice(0, 15),
      malformed_owner_ids: issues.bad_owners.slice(0, 15),
      duplicate_groups: dupExamples,
    },
  });
}
