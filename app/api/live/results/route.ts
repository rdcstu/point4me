// GET /api/live/results?taskId=... — one poll of a running PointsYeah search (owner only).
import { requireOwner } from "@/lib/live-guard";
import { fetchResults, PointsYeahError } from "@/lib/pointsyeah";

export async function GET(request: Request) {
  if (!(await requireOwner())) return Response.json({ error: "Not allowed" }, { status: 403 });
  const taskId = new URL(request.url).searchParams.get("taskId");
  if (!taskId || !/^[\w-]{6,100}$/.test(taskId)) return Response.json({ error: "Missing taskId" }, { status: 400 });
  try {
    return Response.json(await fetchResults(taskId), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Results failed";
    console.error("[live] results failed:", msg);
    return Response.json({ error: msg, kind: err instanceof PointsYeahError ? err.kind : "upstream" }, { status: 502 });
  }
}
