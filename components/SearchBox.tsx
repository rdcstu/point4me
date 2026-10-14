"use client";

import { useState } from "react";
import { SwapIcon, PlaneIcon } from "./Icons";

type TripType = "Round trip" | "One way";
const cabins = ["Economy", "Premium", "Business", "First"] as const;

export function SearchBox() {
  const [tripType, setTripType] = useState<TripType>("Round trip");
  const [travelers, setTravelers] = useState(1);
  const [cabin, setCabin] = useState<(typeof cabins)[number]>("Business");
  const [from, setFrom] = useState("SFO");
  const [to, setTo] = useState("");
  const [depart, setDepart] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    document.getElementById("deals")?.scrollIntoView({ behavior: "smooth" });
  };

  const field =
    "w-full bg-transparent text-base font-semibold text-ink-900 placeholder:text-ink-400 placeholder:font-medium focus:outline-none";
  const label = "block text-[11px] font-semibold uppercase tracking-wider text-ink-500 mb-1";

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Search award flights"
      className="w-full rounded-3xl bg-white p-4 md:p-5 shadow-2xl shadow-ink-900/20 ring-1 ring-ink-900/5"
    >
      {/* Options row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["Round trip", "One way"] as TripType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTripType(t)}
            aria-pressed={tripType === t}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              tripType === t ? "bg-ink-900 text-white" : "bg-ink-50 text-ink-700 hover:bg-ink-100"
            }`}
          >
            {t}
          </button>
        ))}

        <label className="sr-only" htmlFor="travelers">Travelers</label>
        <select
          id="travelers"
          value={travelers}
          onChange={(e) => setTravelers(Number(e.target.value))}
          className="rounded-full bg-ink-50 px-4 py-1.5 text-sm font-semibold text-ink-700 hover:bg-ink-100 focus:outline-none"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "traveler" : "travelers"}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="cabin">Cabin</label>
        <select
          id="cabin"
          value={cabin}
          onChange={(e) => setCabin(e.target.value as (typeof cabins)[number])}
          className="rounded-full bg-ink-50 px-4 py-1.5 text-sm font-semibold text-ink-700 hover:bg-ink-100 focus:outline-none"
        >
          {cabins.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr_auto] gap-2 md:gap-0 md:items-stretch md:rounded-2xl md:border md:border-ink-100">
        <div className="rounded-2xl border border-ink-100 md:border-0 px-4 py-3">
          <label htmlFor="from" className={label}>From</label>
          <input id="from" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="City or airport" className={field} />
        </div>

        <div className="flex items-center justify-center md:-mx-4 z-10">
          <button
            type="button"
            onClick={swap}
            aria-label="Swap origin and destination"
            className="h-9 w-9 rounded-full bg-white ring-1 ring-ink-100 shadow flex items-center justify-center text-ink-700 hover:text-sun-600 transition-colors rotate-90 md:rotate-0"
          >
            <SwapIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl border border-ink-100 md:border-0 md:border-r px-4 py-3">
          <label htmlFor="to" className={label}>To</label>
          <input id="to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Anywhere" className={field} />
        </div>

        <div className="rounded-2xl border border-ink-100 md:border-0 px-4 py-3">
          <label htmlFor="depart" className={label}>{tripType === "Round trip" ? "Dates" : "Depart"}</label>
          <input id="depart" type="date" value={depart} onChange={(e) => setDepart(e.target.value)} className={field} />
        </div>

        <div className="md:p-2">
          <button
            type="submit"
            className="w-full h-full min-h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-sun-500 hover:bg-sun-600 px-6 text-base font-bold text-ink-900 transition-colors"
          >
            <PlaneIcon className="w-5 h-5" />
            Search
          </button>
        </div>
      </div>

      <p role="status" className="mt-3 text-sm text-ink-500 min-h-5">
        {submitted
          ? `Showing sample ${cabin.toLowerCase()} deals${from ? ` from ${from}` : ""} for ${travelers} ${travelers === 1 ? "traveler" : "travelers"}.`
          : "Searches award seats across airline programs — no account needed to explore."}
      </p>
    </form>
  );
}
