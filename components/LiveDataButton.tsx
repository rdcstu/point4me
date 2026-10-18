import Link from "next/link";

// "Live Data" button for the top nav, with a pulsing dot to signal real-time content.
export function LiveDataButton({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/live"
      className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-emerald-400/60 bg-emerald-400/10 font-bold text-white hover:bg-emerald-400/20 transition-colors ${
        compact ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm"
      }`}
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping motion-reduce:animate-none" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      {compact ? "Live" : "Live Data"}
    </Link>
  );
}
