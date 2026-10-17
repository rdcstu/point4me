"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Shows "Log in / Sign up free" when signed out, "My account" when signed in.
// variant="desktop" for the top nav, "mobile" for the slide-out menu.

export function AuthButtons({ variant = "desktop", onNavigate }: { variant?: "desktop" | "mobile"; onNavigate?: () => void }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [initial, setInitial] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const apply = (user: { email?: string; user_metadata?: { full_name?: string } } | null) => {
      setSignedIn(Boolean(user));
      const n = user?.user_metadata?.full_name || user?.email || "";
      setInitial(n.trim().charAt(0).toUpperCase());
    };
    supabase.auth.getUser().then(({ data }) => apply(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (variant === "mobile") {
    return signedIn ? (
      <Link
        href="/account"
        onClick={onNavigate}
        className="bg-sun-500 hover:bg-sun-600 text-ink-900 px-4 py-3 rounded-full text-base font-bold transition-colors text-center mt-4"
      >
        My account
      </Link>
    ) : (
      <>
        <Link href="/login" onClick={onNavigate} className="text-base font-semibold text-ink-700 hover:text-sun-600 transition-colors py-2">
          Log in
        </Link>
        <Link
          href="/signup"
          onClick={onNavigate}
          className="bg-sun-500 hover:bg-sun-600 text-ink-900 px-4 py-3 rounded-full text-base font-bold transition-colors text-center mt-4"
        >
          Sign up free
        </Link>
      </>
    );
  }

  return signedIn ? (
    <Link
      href="/account"
      className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 pl-1.5 pr-4 py-1.5 text-sm font-bold text-white transition-colors"
    >
      <span className="h-7 w-7 rounded-full bg-sun-500 text-ink-900 flex items-center justify-center text-xs font-extrabold" aria-hidden="true">
        {initial || "•"}
      </span>
      My account
    </Link>
  ) : (
    <>
      <Link href="/login" className="text-sm font-semibold text-white/90 hover:text-white px-3 py-2">Log in</Link>
      <Link href="/signup" className="rounded-full bg-sun-500 hover:bg-sun-600 px-5 py-2 text-sm font-bold text-ink-900 transition-colors">
        Sign up free
      </Link>
    </>
  );
}
