"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// "Live Data" button for the top nav. Only shown to the site owner
// (OWNER_EMAILS), since the page uses the owner's personal PointsYeah membership.
export function LiveDataButton({ compact = false }: { compact?: boolean }) {
  const [owner, setOwner] = useState(false);

  useEffect(() => {
    fetch("/api/live/access")
      .then((r) => (r.ok ? r.json() : { owner: false }))
      .then((d) => setOwner(Boolean(d.owner)))
      .catch(() => setOwner(false));
  }, []);

  if (!owner) return null;

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
