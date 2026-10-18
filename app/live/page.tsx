import type { Metadata } from "next";
import Link from "next/link";
import { PlaneIcon } from "@/components/Icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Live Data — ${site.name}`,
};

// Placeholder: the live data feed (award availability, prices, etc.) goes here.
export default function LiveDataPage() {
  return (
    <>
      <header className="bg-ink-900 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2" aria-label={`${site.name} home`}>
            <span className="h-8 w-8 rounded-full bg-sun-500 flex items-center justify-center text-ink-900">
              <PlaneIcon className="w-4 h-4 -rotate-45" />
            </span>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight font-display text-white">{site.name}</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-white/90 hover:text-sun-400">← Back home</Link>
        </div>
      </header>
      <main id="main-content" className="min-h-[calc(100vh-4rem)] bg-ink-50 py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold tracking-wider text-emerald-800 mb-4">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" /> LIVE DATA
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold font-display text-ink-900 mb-3">Live data is coming soon</h1>
          <p className="text-ink-500">This page will show real-time award flight data.</p>
        </div>
      </main>
    </>
  );
}
