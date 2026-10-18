"use client";

import { useEffect, useRef, useState } from "react";
import { buildPointsYeahUrl, type Cabin, type LiveSearchParams } from "@/lib/pointsyeah-url";
import type { FlightResult, FlightRoute } from "@/lib/pointsyeah";

// Private search over the owner's PointsYeah membership.
// "Show results here" runs the search through our server; "Open in PointsYeah"
// always works as a fallback, using the PointsYeah tab you're logged into.

const CABINS: Cabin[] = ["Economy", "Premium Economy", "Business", "First"];
const fmt = new Intl.NumberFormat("en-US");
const RECENT_KEY = "p4m-live-recent";

type Phase = "idle" | "starting" | "polling" | "done" | "error";

function inDays(n: number) {
  const d = new Date(Date.now() + n * 86_400_000);
  return d.toISOString().slice(0, 10);
}

function time(iso: string) {
  return iso?.split("T")[1]?.slice(0, 5) ?? "";
}

function duration(min: number) {
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

type Row = { result: FlightResult; route: FlightRoute };

export function LiveSearch() {
  const [form, setForm] = useState<LiveSearchParams>({
    departure: "SFO",
    arrival: "",
    departDate: inDays(30),
    returnDate: inDays(37),
    tripType: "1",
    adults: 1,
    children: 0,
    cabins: ["Business"],
  });
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState<string | null>(null);
  const [results, setResults] = useState<Map<string, FlightResult>>(new Map());
  const [elapsed, setElapsed] = useState(0);
  const [recent, setRecent] = useState<LiveSearchParams[]>([]);
  const cancelRef = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
      if (Array.isArray(saved)) setRecent(saved.slice(0, 6));
    } catch {
      /* storage unavailable — fine */
    }
  }, []);

  useEffect(() => {
    if (phase !== "starting" && phase !== "polling") return;
    const t0 = Date.now();
    const id = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const set = <K extends keyof LiveSearchParams>(k: K, v: LiveSearchParams[K]) => setForm((f) => ({ ...f, [k]: v }));
  const toggleCabin = (c: Cabin) =>
    set("cabins", form.cabins.includes(c) ? form.cabins.filter((x) => x !== c) : [...form.cabins, c]);

  const valid =
    /^[A-Za-z]{3}$/.test(form.departure) &&
    /^[A-Za-z]{3}$/.test(form.arrival) &&
    Boolean(form.departDate) &&
    (form.tripType === "1" || Boolean(form.returnDate)) &&
    form.cabins.length > 0;

  const pyUrl = valid ? buildPointsYeahUrl(form) : null;

  function remember(p: LiveSearchParams) {
    const key = (x: LiveSearchParams) => `${x.departure}-${x.arrival}-${x.tripType}-${x.cabins.join()}`;
    const next = [p, ...recent.filter((r) => key(r) !== key(p))].slice(0, 6);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    cancelRef.current = false;
    setPhase("starting");
    setError(null);
    setFallback(pyUrl);
    setResults(new Map());
    setElapsed(0);
    remember(form);

    try {
      const res = await fetch("/api/live/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      if (data.fallbackUrl) setFallback(data.fallbackUrl);
      setPhase("polling");

      const acc = new Map<string, FlightResult>();
      for (let i = 0; i < 120 && !cancelRef.current; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const pr = await fetch(`/api/live/results?taskId=${encodeURIComponent(data.taskId)}`);
        const pd = await pr.json();
        if (!pr.ok) throw new Error(pd.error ?? "Couldn't get results");
        for (const r of pd.results as FlightResult[]) acc.set(`${r.code}-${r.date}-${r.departure}-${r.arrival}`, r);
        setResults(new Map(acc));
        if (pd.status === "done") break;
      }
      setPhase(cancelRef.current ? "idle" : "done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setPhase("error");
    }
  }

  // Flatten to one row per bookable option, cheapest points first
  const rows: Row[] = [];
  for (const result of results.values()) for (const route of result.routes ?? []) if (route.payment) rows.push({ result, route });
  rows.sort((a, b) => (a.route.payment!.miles ?? 0) - (b.route.payment!.miles ?? 0));

  const busy = phase === "starting" || phase === "polling";
  const field = "w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-900 focus:border-sun-500 focus:outline-none focus:ring-4 focus:ring-sun-300/40";
  const label = "block text-xs font-bold uppercase tracking-wider text-ink-500 mb-1";

  return (
    <div className="space-y-6">
      {/* ---------- Search form ---------- */}
      <form onSubmit={run} className="rounded-3xl bg-white ring-1 ring-ink-900/5 p-5 md:p-6" aria-label="Search PointsYeah">
        <div className="flex flex-wrap gap-2 mb-4">
          {(["1", "2"] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={form.tripType === t}
              onClick={() => set("tripType", t)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${form.tripType === t ? "bg-ink-900 text-white" : "bg-ink-50 text-ink-700"}`}
            >
              {t === "1" ? "One way" : "Round trip"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label htmlFor="lv-from" className={label}>From</label>
            <input id="lv-from" value={form.departure} maxLength={3} onChange={(e) => set("departure", e.target.value.toUpperCase())} placeholder="SFO" className={`${field} uppercase`} />
          </div>
          <div>
            <label htmlFor="lv-to" className={label}>To</label>
            <input id="lv-to" value={form.arrival} maxLength={3} onChange={(e) => set("arrival", e.target.value.toUpperCase())} placeholder="NRT" className={`${field} uppercase`} />
          </div>
          <div>
            <label htmlFor="lv-dep" className={label}>Depart</label>
            <input id="lv-dep" type="date" value={form.departDate} onChange={(e) => set("departDate", e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor="lv-ret" className={label}>Return</label>
            <input
              id="lv-ret"
              type="date"
              value={form.returnDate ?? ""}
              disabled={form.tripType === "1"}
              onChange={(e) => set("returnDate", e.target.value)}
              className={`${field} disabled:bg-ink-50 disabled:text-ink-400`}
            />
          </div>
          <div>
            <label htmlFor="lv-adults" className={label}>Adults</label>
            <select id="lv-adults" value={form.adults} onChange={(e) => set("adults", Number(e.target.value))} className={field}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className={label}>Cabins</legend>
          <div className="flex flex-wrap gap-2">
            {CABINS.map((c) => (
              <label key={c} className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ${form.cabins.includes(c) ? "bg-sun-500 ring-sun-500 text-ink-900" : "bg-white ring-ink-200 text-ink-700"}`}>
                <input type="checkbox" className="sr-only" checked={form.cabins.includes(c)} onChange={() => toggleCabin(c)} />
                {c}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={!valid || busy} className="rounded-full bg-sun-500 hover:bg-sun-600 px-6 py-3 font-bold text-ink-900 transition-colors disabled:opacity-50">
            {busy ? "Searching…" : "Show results here"}
          </button>
          <a
            href={pyUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!pyUrl}
            className={`rounded-full px-6 py-3 text-center font-bold ring-2 ring-ink-900 text-ink-900 hover:bg-ink-50 transition-colors ${pyUrl ? "" : "pointer-events-none opacity-50"}`}
          >
            Open in PointsYeah ↗
          </a>
          {busy && (
            <button type="button" onClick={() => (cancelRef.current = true)} className="text-sm font-semibold text-ink-500 hover:text-ink-900">
              Stop
            </button>
          )}
        </div>

        {recent.length > 0 && (
          <div className="mt-5">
            <p className={label}>Recent</p>
            <div className="flex flex-wrap gap-2">
              {recent.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setForm({ ...r, departDate: form.departDate, returnDate: form.returnDate })}
                  className="rounded-full bg-ink-50 hover:bg-ink-100 px-3 py-1 text-sm font-semibold text-ink-700"
                >
                  {r.departure} → {r.arrival} · {r.cabins.join("/")}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* ---------- Status ---------- */}
      <div aria-live="polite">
        {busy && (
          <p className="rounded-2xl bg-white ring-1 ring-ink-900/5 px-5 py-4 text-ink-700">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2" aria-hidden="true" />
            {phase === "starting" ? "Starting search on PointsYeah" : `Searching airline programs · ${rows.length} options so far`} · {elapsed}s
          </p>
        )}
        {phase === "error" && (
          <div className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 px-5 py-4">
            <p className="font-semibold text-rose-800 mb-2">Couldn&apos;t show results here: {error}</p>
            {fallback && (
              <a href={fallback} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full bg-ink-900 px-5 py-2.5 font-bold text-white">
                Open this search in PointsYeah ↗
              </a>
            )}
          </div>
        )}
        {phase === "done" && rows.length === 0 && (
          <p className="rounded-2xl bg-white ring-1 ring-ink-900/5 px-5 py-4 text-ink-700">No award seats found for this search. Try other dates or cabins.</p>
        )}
      </div>

      {/* ---------- Results ---------- */}
      {rows.length > 0 && (
        <section aria-label="Results" className="space-y-3">
          <p className="text-sm text-ink-500">{rows.length} options · cheapest points first</p>
          {rows.slice(0, 100).map(({ result, route }, i) => {
            const p = route.payment!;
            const segs = route.segments ?? [];
            const first = segs[0];
            const last = segs[segs.length - 1];
            const transfers = (route.transfer ?? []).slice().sort((a, b) => a.points - b.points);
            return (
              <article key={i} className="rounded-2xl bg-white ring-1 ring-ink-900/5 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink-900">{result.program}</p>
                    <p className="text-sm text-ink-500">
                      {result.date} · {result.departure} → {result.arrival}
                      {first && last && ` · ${time(first.dt)}–${time(last.at)}`} · {segs.length <= 1 ? "Nonstop" : `${segs.length - 1} stop${segs.length > 2 ? "s" : ""}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-ink-900">
                      {fmt.format(p.miles)} <span className="text-sm font-semibold text-ink-500">{p.unit || "pts"}</span>
                    </p>
                    <p className="text-sm text-ink-500">
                      + ${p.tax.toFixed(0)} · {p.cabin} · {p.seats} seat{p.seats === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                {segs.length > 0 && (
                  <p className="mt-3 text-sm text-ink-700">
                    {segs.map((s) => `${s.flight_number} ${s.da}→${s.aa} (${duration(s.duration)})`).join("  ·  ")}
                  </p>
                )}
                {transfers.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {transfers.map((t) => (
                      <span key={t.bank} className="rounded-full bg-ink-50 px-2.5 py-1 text-xs font-semibold text-ink-700">
                        {t.bank}: {fmt.format(t.points)}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
          {fallback && (
            <a href={fallback} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-bold text-sun-600 hover:text-ink-900">
              See full results and book on PointsYeah ↗
            </a>
          )}
        </section>
      )}
    </div>
  );
}
