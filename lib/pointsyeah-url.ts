// Builds a PointsYeah search link. Safe to use in the browser (no secrets).
// Parameter format adapted from pulsemcp/mcp-servers (MIT License, © 2025 PulseMCP).

export type Cabin = "Economy" | "Premium Economy" | "Business" | "First";

export type LiveSearchParams = {
  departure: string; // airport or city code, e.g. "SFO"
  arrival: string;
  departDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD, round trips only
  tripType: "1" | "2"; // 1 = one way, 2 = round trip
  adults: number;
  children: number;
  cabins: Cabin[];
};

export const DEFAULT_BANKS = "Amex,Bilt,Capital One,Chase,Citi,WF";
export const DEFAULT_AIRLINE_PROGRAMS = "AR,AM,AC,KL,AS,AA,AV,DL,EK,EY,AY,B6,LH,QF,SK,SQ,NK,TK,UA,VS,VA";

export function buildPointsYeahUrl(p: LiveSearchParams) {
  const q = new URLSearchParams({
    cabins: p.cabins.join(","),
    cabin: p.cabins[0] ?? "Economy",
    banks: DEFAULT_BANKS,
    airlineProgram: DEFAULT_AIRLINE_PROGRAMS,
    tripType: p.tripType,
    adults: String(p.adults),
    children: String(p.children),
    departure: p.departure.toUpperCase(),
    arrival: p.arrival.toUpperCase(),
    departDate: p.departDate,
    departDateSec: p.departDate,
    multiday: "false",
  });
  if (p.tripType === "2" && p.returnDate) {
    q.set("returnDate", p.returnDate);
    q.set("returnDateSec", p.returnDate);
  }
  return `https://www.pointsyeah.com/search?${q.toString()}`;
}
