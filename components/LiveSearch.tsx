"use client";

import { useEffect, useState } from "react";
import { buildPointsYeahUrl, type Cabin } from "@/lib/pointsyeah-url";
import type { ApiCabin, ExplorerResult, SortKey } from "@/lib/pointsyeah";

// Private award search using the owner's official PointsYeah API key.
// Results come from PointsYeah's explorer (about 61 days of upcoming availability).

const CABINS: { api: ApiCabin; label: string; link: Cabin }[] = [
  { api: "Economy", label: "Economy", link: "Economy" },
  { api: "Premium", label: "Premium", link: "Premium Economy" },
  { api: "Business", label: "Business", link: "Business" },
  { api: "First", label: "First", link: "First" },
];
const SORTS: { key: SortKey; label: string }[] = [
  { key: "miles", label: "Fewest points" },
  { key: "tax", label: "Lowest taxes" },
  { key: "duration", label: "Shortest" },
  { key: "-updated_at", label: "Newest" },
];
const fmt = new Intl.NumberFormat("en-US");
const RECENT_KEY = "p4m-live-recent-v2";

type Form = {
  from: string;
  to: string;
  startDate: string;
  endDate: string;
  cabins: ApiCabin[];
  sort: SortKey;
  stops: string; // "" = any
  maxPoints: string;
  seats: number;
};

function inDays(n: number) {
  return new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
}
function duration(min: number) {
  return min ? `${Math.floor(min / 60)}h ${min % 60}m` : "";
}
function ago(ms: number) {
  const m = Math.round((Date.now() - ms) / 60000);
  if (m < 60) return `${Math.max(1, m)} min ago`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} days ago`;
}

export function LiveSearch({ inPage = true }: { inPage?: boolean }) {
  const [form, setForm] = useState<Form>({
    from: "SFO",
    to: "",
    startDate: inDays(1),
    endDate: inDays(60),
    cabins: ["Business"],
    sort: "miles",
    stops: "",
    maxPoints: "",
    seats: 1,
  });
  const [results, setResults] = useState<ExplorerResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<Form[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
      if (Array.isArray(saved)) setRecent(saved.slice(0, 6));
    } catch {
      /* storage unavailable — fine */
    }
  }, []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const toggleCabin = (c: ApiCabin) => set("cabins", form.cabins.includes(c) ? form.cabins.filter((x) => x !== c) : [...form.cabins, c]);

  const codes = (s: string) => s.split(/[\s,]+/).map((c) => c.trim().toUpperCase()).filter((c) => /^[A-Z]{3}$/.test(c));
  const valid = (codes(form.from).length > 0 || codes(form.to).length > 0) && form.startDate && form.endDate >= form.startDate && form.cabins.length > 0;

  // PointsYeah link for the first from/to pair (one-way on the start date)
  const f0 = codes(form.from)[0];
  const t0 = codes(form.to)[0];
  const pyUrl =
    f0 && t0
      ? buildPointsYeahUrl({
          departure: f0,
          arrival: t0,
          departDate: form.startDate,
          tripType: "1",
          adults: form.seats,
          children: 0,
          cabins: CABINS.filter((c) => form.cabins.includes(c.api)).map((c) => c.link),
        })
      : null;

  function remember(f: Form) {
    const key = (x: Form) => `${x.from}|${x.to}|${x.cabins.join()}`;
    const next = [f, ...recent.filter((r) => key(r) !== key(f))].slice(0, 6);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  async function search(nextPage = 1) {
    if (!valid) return;
    if (!inPage) {
      remember(form);
      if (pyUrl) window.open(pyUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setBusy(true);
    setError(null);
    if (nextPage === 1) remember(form);
    try {
      const res = await fetch("/api/live/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, page: nextPage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults((prev) => (nextPage === 1 ? data.results : [...prev, ...data.results]));
      setTotal(data.total);
      setPage(nextPage);
      setCached(Boolean(data.cached));
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-900 focus:border-sun-500 focus:outline-none focus:ring-4 focus:ring-sun-300/40";
  const label = "block text-xs font-bold uppercase tracking-wider text-ink-500 mb-1";

  return (
    <div className="space-y-6">
      {/* ---------- Search form ---------- */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search(1);
        }}
        className="rounded-3xl bg-white ring-1 ring-ink-900/5 p-5 md:p-6"
        aria-label="Search PointsYeah"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label htmlFor="lv-from" className={label}>From</label>
            <input id="lv-from" value={form.from} onChange={(e) => set("from", e.target.value.toUpperCase())} placeholder="SFO, SJC" className={`${field} uppercase`} />
          </div>
          <div>
            <label htmlFor="lv-to" className={label}>To</label>
            <input id="lv-to" value={form.to} onChange={(e) => set("to", e.target.value.toUpperCase())} placeholder="NRT, HND" className={`${field} uppercase`} />
          </div>
          <div>
            <label htmlFor="lv-start" className={label}>Earliest date</label>
            <input id="lv-start" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor="lv-end" className={label}>Latest date</label>
            <input id="lv-end" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor="lv-stops" className={label}>Stops</label>
            <select id="lv-stops" value={form.stops} onChange={(e) => set("stops", e.target.value)} className={field}>
              <option value="">Any</option>
              <option value="0">Nonstop</option>
              <option value="1">Up to 1</option>
              <option value="2">Up to 2</option>
            </select>
          </div>
          <div>
            <label htmlFor="lv-max" className={label}>Max points</label>
            <input id="lv-max" inputMode="numeric" value={form.maxPoints} onChange={(e) => set("maxPoints", e.target.value.replace(/\D/g, ""))} placeholder="Any" className={field} />
          </div>
          <div>
            <label htmlFor="lv-seats" className={label}>Seats</label>
            <select id="lv-seats" value={form.seats} onChange={(e) => set("seats", Number(e.target.value))} className={field}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="lv-sort" className={label}>Sort</label>
            <select id="lv-sort" value={form.sort} onChange={(e) => set("sort", e.target.value as SortKey)} className={field}>
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className={label}>Cabins</legend>
          <div className="flex flex-wrap gap-2">
            {CABINS.map((c) => (
              <label
                key={c.api}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ${
                  form.cabins.includes(c.api) ? "bg-sun-500 ring-sun-500 text-ink-900" : "bg-white ring-ink-200 text-ink-700"
                }`}
              >
                <input type="checkbox" className="sr-only" checked={form.cabins.includes(c.api)} onChange={() => toggleCabin(c.api)} />
                {c.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
          <button type="submit" disabled={!valid || busy} className="rounded-full bg-sun-500 hover:bg-sun-600 px-6 py-3 font-bold text-ink-900 transition-colors disabled:opacity-50">
            {!inPage ? "Search on PointsYeah ↗" : busy ? "Searching…" : "Search"}
          </button>
          {inPage && pyUrl && (
            <a href={pyUrl} target="_blank" rel="noopener noreferrer" className="rounded-full px-6 py-3 text-center font-bold ring-2 ring-ink-900 text-ink-900 hover:bg-ink-50 transition-colors">
              Open in PointsYeah ↗
            </a>
          )}
          <p className="text-xs text-ink-400">Separate several airports with commas. Leave From or To empty to search anywhere.</p>
        </div>

        {!inPage && (
          <p className="mt-3 text-sm text-ink-500">
            In-page results turn on once your PointsYeah API key is added to <code>.env.local</code> as <code>POINTSYEAH_API_KEY</code>.
          </p>
        )}

        {recent.length > 0 && (
          <div className="mt-5">
            <p className={label}>Recent</p>
            <div className="flex flex-wrap gap-2">
              {recent.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setForm({ ...r, startDate: form.startDate, endDate: form.endDate })}
                  className="rounded-full bg-ink-50 hover:bg-ink-100 px-3 py-1 text-sm font-semibold text-ink-700"
                >
                  {r.from || "Anywhere"} → {r.to || "Anywhere"} · {r.cabins.join("/")}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* ---------- Status ---------- */}
      <div aria-live="polite">
        {error && (
          <div className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 px-5 py-4">
            <p className="font-semibold text-rose-800 mb-2">{error}</p>
            {pyUrl && (
              <a href={pyUrl} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full bg-ink-900 px-5 py-2.5 font-bold text-white">
                Open this search in PointsYeah ↗
              </a>
            )}
          </div>
        )}
        {searched && !error && results.length === 0 && (
          <p className="rounded-2xl bg-white ring-1 ring-ink-900/5 px-5 py-4 text-ink-700">No award seats found. Try more airports, a wider date range or other cabins.</p>
        )}
      </div>

      {/* ---------- Results ---------- */}
      {results.length > 0 && (
        <section aria-label="Results" className="space-y-3">
          <p className="text-sm text-ink-500">
            Showing {results.length} of {fmt.format(total)} options{cached ? " · from cache" : ""}
          </p>
          {results.map((r, i) => (
            <article key={`${r.program}-${r.departure_date}-${r.departure.code}-${r.arrival.code}-${r.cabin}-${i}`} className="rounded-2xl bg-white ring-1 ring-ink-900/5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ink-900">
                    {r.departure.city || r.departure.code} ({r.departure.code}) → {r.arrival.city || r.arrival.code} ({r.arrival.code})
                  </p>
                  <p className="text-sm text-ink-500">
                    {r.departure_date} · {r.program} · {r.stops === 0 ? "Nonstop" : `${r.stops} stop${r.stops > 1 ? "s" : ""}`}
                    {r.duration ? ` · ${duration(r.duration)}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-ink-900">
                    {fmt.format(r.miles)} <span className="text-sm font-semibold text-ink-500">pts</span>
                  </p>
                  <p className="text-sm text-ink-500">
                    + ${Math.round(r.tax)} · {r.cabin} · {r.seats} seat{r.seats === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {(r.transfer ?? []).map((t) => (
                  <span key={t.bank} className="rounded-full bg-ink-50 px-2.5 py-1 text-xs font-semibold text-ink-700">
                    {t.bank}
                    {t.bonus_percentage ? ` +${t.bonus_percentage}% bonus` : ""}
                  </span>
                ))}
                <span className="ml-auto flex items-center gap-3 text-xs text-ink-400">
                  {r.updated_at ? `Updated ${ago(r.updated_at)}` : ""}
                  {r.detail_url && (
                    <a href={r.detail_url} target="_blank" rel="noopener noreferrer" className="font-bold text-sun-600 hover:text-ink-900">
                      View on PointsYeah ↗
                    </a>
                  )}
                </span>
              </div>
            </article>
          ))}
          {results.length < total && (
            <button
              type="button"
              onClick={() => search(page + 1)}
              disabled={busy}
              className="w-full rounded-full ring-2 ring-ink-900 px-6 py-3 font-bold text-ink-900 hover:bg-white disabled:opacity-50"
            >
              {busy ? "Loading…" : "Load more"}
            </button>
          )}
        </section>
      )}
    </div>
  );
}
