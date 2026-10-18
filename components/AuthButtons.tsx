"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { activePlan, type PaidPlanId } from "@/lib/entitlements";

// Signed out: "Log in" + "Sign up free".
// Signed in: "My account" with the member's initial, plus a plan badge and a
// "Members area" link for paying members.
// variant="desktop" for the top nav, "mobile" for the slide-out menu.

const PLAN_LABEL: Record<PaidPlanId, string> = { member: "Member", plus: "Member Plus" };

function PlanBadge({ plan, className = "inline-flex" }: { plan: PaidPlanId; className?: string }) {
  return (
    <span
      className={`items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider ${
        plan === "plus" ? "bg-gradient-to-r from-sun-400 to-sun-500 text-ink-900" : "bg-white/15 text-sun-300 ring-1 ring-sun-400/40"
      } ${className}`}
    >
      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.29a1 1 0 00.95.69h3.46c.97 0 1.37 1.24.59 1.81l-2.8 2.03a1 1 0 00-.36 1.12l1.07 3.29c.3.92-.76 1.69-1.54 1.12l-2.8-2.03a1 1 0 00-1.18 0l-2.8 2.03c-.78.57-1.84-.2-1.54-1.12l1.07-3.29a1 1 0 00-.36-1.12L2.98 8.72c-.78-.57-.38-1.81.59-1.81h3.46a1 1 0 00.95-.69L9.05 2.93z" />
      </svg>
      {PLAN_LABEL[plan]}
    </span>
  );
}

export function AuthButtons({ variant = "desktop", onNavigate }: { variant?: "desktop" | "mobile"; onNavigate?: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    // getUser asks the server, so a just-purchased plan shows up right away
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoaded(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setUser(null);
      else supabase.auth.getUser().then(({ data }) => setUser(data.user));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signedIn = loaded && Boolean(user);
  const plan = activePlan(user);
  const name = (user?.user_metadata?.full_name as string | undefined) || user?.email || "";
  const initial = name.trim().charAt(0).toUpperCase();

  if (variant === "mobile") {
    if (!signedIn) {
      return (
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
    return (
      <>
        {plan && (
          <Link href="/members" onClick={onNavigate} className="text-base font-semibold text-ink-700 hover:text-sun-600 transition-colors py-2">
            Members area
          </Link>
        )}
        <div className="mt-4 rounded-2xl bg-ink-900 p-4 text-white">
          <p className="text-sm text-white/70 truncate">{user?.email}</p>
          <div className="mt-2">
            {plan ? <PlanBadge plan={plan} /> : <span className="text-xs font-bold uppercase tracking-wider text-white/60">Explorer · Free</span>}
          </div>
          <Link
            href="/account"
            onClick={onNavigate}
            className="mt-4 block bg-sun-500 hover:bg-sun-600 text-ink-900 px-4 py-2.5 rounded-full text-base font-bold transition-colors text-center"
          >
            My account
          </Link>
        </div>
      </>
    );
  }

  if (!signedIn) {
    return (
      <>
        <Link href="/login" className="whitespace-nowrap text-sm font-semibold text-white/90 hover:text-white px-3 py-2">Log in</Link>
        <Link href="/signup" className="whitespace-nowrap rounded-full bg-sun-500 hover:bg-sun-600 px-5 py-2 text-sm font-bold text-ink-900 transition-colors">
          Sign up free
        </Link>
      </>
    );
  }

  return (
    <>
      {plan && (
        <Link href="/members" className="hidden xl:inline text-sm font-semibold text-white/80 hover:text-white px-2 py-2">
          Members area
        </Link>
      )}
      <Link
        href="/account"
        aria-label={`My account${plan ? `, ${PLAN_LABEL[plan]} plan` : ""}`}
        className={`inline-flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 text-sm font-bold text-white transition-colors ${
          plan === "plus" ? "bg-sun-500/15 hover:bg-sun-500/25 ring-1 ring-sun-400/60" : "bg-white/10 hover:bg-white/15"
        }`}
      >
        <span
          className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
            plan ? "bg-sun-500 text-ink-900 ring-2 ring-sun-300" : "bg-white/20 text-white"
          }`}
          aria-hidden="true"
        >
          {initial || "•"}
        </span>
        My account
        {plan && <PlanBadge plan={plan} className="hidden xl:inline-flex" />}
      </Link>
    </>
  );
}
