"use client";

import { useRef } from "react";
import { deals } from "@/lib/site";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

const fmt = new Intl.NumberFormat("en-US");

export function DealCarousel() {
  const track = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-sun-600 mb-2">Trending now</p>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-ink-900">Best award deals right now</h2>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Previous deals"
            className="h-11 w-11 rounded-full border border-ink-200 bg-white flex items-center justify-center text-ink-700 hover:bg-ink-900 hover:text-white transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Next deals"
            className="h-11 w-11 rounded-full border border-ink-200 bg-white flex items-center justify-center text-ink-700 hover:bg-ink-900 hover:text-white transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={track}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
      >
        {deals.map((d) => {
          const cpp = (((d.cashPrice - d.taxes) / d.points) * 100).toFixed(1);
          return (
            <article
              key={`${d.fromCode}-${d.toCode}`}
              role="listitem"
              className="snap-start shrink-0 w-[80%] sm:w-[46%] lg:w-[31%] rounded-3xl bg-white ring-1 ring-ink-900/5 shadow-lg shadow-ink-900/5 overflow-hidden group"
            >
              <div className={`relative h-40 bg-gradient-to-br ${d.gradient} p-5 flex flex-col justify-between`}>
                <span
                  className={`self-start rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wider ${
                    d.rating === "GREAT DEAL" ? "bg-white text-ink-900" : "bg-ink-900/70 text-white"
                  }`}
                >
                  {d.rating === "GREAT DEAL" ? "🔥 " : ""}
                  {d.rating}
                </span>
                <div className="text-white">
                  <p className="text-sm font-semibold opacity-90">{d.from} → </p>
                  <p className="text-3xl font-bold font-display leading-tight drop-shadow-sm">{d.to}</p>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between text-sm text-ink-500 mb-3">
                  <span className="font-semibold">{d.fromCode} – {d.toCode}</span>
                  <span className="rounded-full bg-ink-50 px-2.5 py-0.5 font-semibold text-ink-700">{d.cabin}</span>
                </div>
                <p className="text-2xl font-bold text-ink-900">
                  {fmt.format(d.points)} <span className="text-base font-semibold text-ink-500">pts</span>
                  <span className="text-base font-semibold text-ink-500"> + ${d.taxes}</span>
                </p>
                <p className="text-sm text-ink-500 mt-1">
                  vs <span className="line-through">${fmt.format(d.cashPrice)}</span> cash · <span className="font-semibold text-emerald-600">{cpp}¢/pt</span>
                </p>
                <p className="text-xs text-ink-400 mt-3">{d.program}</p>
              </div>
            </article>
          );
        })}
      </div>
      <p className="text-xs text-ink-400 mt-2">Sample fares for demonstration. One way, per traveler.</p>
    </div>
  );
}
