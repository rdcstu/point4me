// Server-only client for the official PointsYeah API (premium membership).
// Docs: https://www.pointsyeah.com/developers/getting-started
// Uses your personal API key (POINTSYEAH_API_KEY) — keep it in .env.local only.

const BASE = "https://ai-api.pointsyeah.com";

export type ApiCabin = "Economy" | "Premium" | "Business" | "First";
export type SortKey = "miles" | "tax" | "duration" | "-updated_at";

export type ExplorerQuery = {
  from: string[]; // IATA airport codes
  to: string[];
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD (data covers ~61 days ahead)
  cabins: ApiCabin[];
  sort: SortKey;
  stops?: number; // max stops
  maxPoints?: number;
  seats: number;
  page: number;
  pageSize: number;
};

export type ExplorerPlace = { code: string; city: string; country_name: string };
export type ExplorerTransfer = { bank: string; bonus_percentage: number; url: string; code: string };
export type ExplorerResult = {
  program: string;
  departure_date: string;
  departure: ExplorerPlace;
  arrival: ExplorerPlace;
  miles: number;
  tax: number;
  cabin: string;
  detail_url: string;
  stops: number;
  seats: number;
  duration: number; // minutes
  updated_at: number; // ms
  transfer: ExplorerTransfer[] | null;
};

export class PointsYeahError extends Error {
  constructor(message: string, public kind: "setup" | "auth" | "limit" | "upstream") {
    super(message);
  }
}

// Small in-memory cache so repeat searches don't use up the 1,000 calls/day
const cache = new Map<string, { at: number; data: { total: number; results: ExplorerResult[] } }>();
const TTL_MS = 10 * 60 * 1000;

export async function searchExplorer(q: ExplorerQuery) {
  const key = process.env.POINTSYEAH_API_KEY?.trim();
  if (!key) throw new PointsYeahError("POINTSYEAH_API_KEY is not set in .env.local", "setup");

  const place = (airports: string[]) => ({ airports, countries: [], continents: [], regions: [], states: [] });
  const body = {
    departure: place(q.from),
    arrival: place(q.to),
    start_date: q.startDate,
    end_date: q.endDate,
    cabins: q.cabins,
    sort: q.sort,
    seats: q.seats,
    weekend_only: false,
    collection: false,
    ...(q.stops !== undefined ? { stops: q.stops } : {}),
    ...(q.maxPoints ? { max_points: q.maxPoints } : {}),
    pagination: { page: q.page, page_size: q.pageSize },
  };

  const cacheKey = JSON.stringify(body);
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < TTL_MS) return { ...hit.data, cached: true };

  const res = await fetch(`${BASE}/explorer/search`, {
    method: "POST",
    headers: { "X-API-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
    cache: "no-store",
  });

  const text = await res.text();
  let json: { total?: number; results?: ExplorerResult[]; message?: string } = {};
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON error */
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403)
      throw new PointsYeahError("PointsYeah rejected the API key. Check POINTSYEAH_API_KEY in .env.local.", "auth");
    if (res.status === 429)
      throw new PointsYeahError("You've hit PointsYeah's daily API limit (1,000 calls). Try again tomorrow.", "limit");
    throw new PointsYeahError(json.message ?? `PointsYeah API error (${res.status})`, "upstream");
  }

  const data = { total: json.total ?? 0, results: json.results ?? [] };
  cache.set(cacheKey, { at: Date.now(), data });
  return { ...data, cached: false };
}
