// POST /api/live/search — searches the official PointsYeah API (owner only).
import { requireOwner } from "@/lib/live-guard";
import { searchExplorer, PointsYeahError, type ApiCabin, type SortKey } from "@/lib/pointsyeah";

const CABINS: ApiCabin[] = ["Economy", "Premium", "Business", "First"];
const SORTS: SortKey[] = ["miles", "tax", "duration", "-updated_at"];
const codes = (v: unknown) =>
  (typeof v === "string" ? v.split(/[\s,]+/) : [])
    .map((c) => c.trim().toUpperCase())
    .filter((c) => /^[A-Z]{3}$/.test(c))
    .slice(0, 10);
const date = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
const num = (v: unknown) => (v === "" || v === null || v === undefined || isNaN(Number(v)) ? undefined : Number(v));

export async function POST(request: Request) {
  if (!(await requireOwner())) return Response.json({ error: "Not allowed" }, { status: 403 });

  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const from = codes(b.from);
  const to = codes(b.to);
  const startDate = date(b.startDate);
  const endDate = date(b.endDate);
  const cabins = (Array.isArray(b.cabins) ? b.cabins : []).filter((c): c is ApiCabin => CABINS.includes(c as ApiCabin));
  const sort = SORTS.includes(b.sort as SortKey) ? (b.sort as SortKey) : "miles";

  if ((from.length === 0 && to.length === 0) || !startDate || !endDate || endDate < startDate) {
    return Response.json({ error: "Enter at least one airport code (From or To) and a valid date range." }, { status: 400 });
  }

  try {
    const data = await searchExplorer({
      from,
      to,
      startDate,
      endDate,
      cabins: cabins.length ? cabins : ["Economy"],
      sort,
      stops: num(b.stops),
      maxPoints: num(b.maxPoints),
      seats: Math.min(9, Math.max(1, num(b.seats) ?? 1)),
      page: Math.max(1, num(b.page) ?? 1),
      pageSize: 24,
    });
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const e = err instanceof PointsYeahError ? err : new PointsYeahError("Search failed", "upstream");
    console.error("[live] search failed:", e.kind, e.message);
    return Response.json({ error: e.message, kind: e.kind }, { status: e.kind === "setup" ? 500 : 502 });
  }
}
