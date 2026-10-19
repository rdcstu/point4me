// GET /api/live/access — lets the nav decide whether to show the Live Data button.
import { requireOwner } from "@/lib/live-guard";

export async function GET() {
  return Response.json({ owner: Boolean(await requireOwner()) }, { headers: { "Cache-Control": "no-store" } });
}
