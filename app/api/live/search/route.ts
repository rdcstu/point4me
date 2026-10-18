// POST /api/live/search — starts a PointsYeah search (owner only). Returns { taskId }.
import { requireOwner } from "@/lib/live-guard";
import { createSearchTask, PointsYeahError } from "@/lib/pointsyeah";
import { buildPointsYeahUrl, type Cabin, type LiveSearchParams } from "@/lib/pointsyeah-url";

export const maxDuration = 90; // seconds; the hidden browser can be slow

const CABINS: Cabin[] = ["Economy", "Premium Economy", "Business", "First"];
const code = (v: unknown) => (typeof v === "string" && /^[A-Za-z]{3}$/.test(v.trim()) ? v.trim().toUpperCase() : null);
const date = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

export async function POST(request: Request) {
  if (!(await requireOwner())) return Response.json({ error: "Not allowed" }, { status: 403 });

  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const departure = code(b.departure);
  const arrival = code(b.arrival);
  const departDate = date(b.departDate);
  const tripType = b.tripType === "2" ? "2" : "1";
  const returnDate = tripType === "2" ? date(b.returnDate) : null;
  const cabins = (Array.isArray(b.cabins) ? b.cabins : []).filter((c): c is Cabin => CABINS.includes(c as Cabin));
  const adults = Math.min(9, Math.max(1, Number(b.adults) || 1));

  if (!departure || !arrival || !departDate || (tripType === "2" && !returnDate) || cabins.length === 0) {
    return Response.json({ error: "Please enter 3-letter airport codes, dates, and at least one cabin." }, { status: 400 });
  }

  const params: LiveSearchParams = {
    departure,
    arrival,
    departDate,
    returnDate: returnDate ?? undefined,
    tripType,
    adults,
    children: 0,
    cabins,
  };
  const fallbackUrl = buildPointsYeahUrl(params);

  try {
    const taskId = await createSearchTask(params);
    return Response.json({ taskId, fallbackUrl });
  } catch (err) {
    const e = err instanceof PointsYeahError ? err : new PointsYeahError(err instanceof Error ? err.message : "Search failed", "upstream");
    console.error("[live] search failed:", e.kind, e.message);
    return Response.json({ error: e.message, kind: e.kind, fallbackUrl }, { status: 502 });
  }
}
