"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { signupPlans, conciergeFromPrice } from "@/lib/site";
import { priceFor, maxSavingsPct, type Billing } from "@/lib/pricing";
import { activePlan, getSubscription } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/client";
import { CheckIcon } from "./Icons";

// Home-page pricing: same plans and prices as /signup (both read lib/site.ts).
// Knows who's signed in so it can mark "Your plan" and offer switches.

const RANK: Record<string, number> = { explorer: 0, member: 1, plus: 2 };

export function PricingSection() {
  const [billing, setBilling] = useState<Billing>("annual");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setUser(data.user));
  }, []);

  const current = user ? activePlan(user) ?? "explorer" : null; // null = signed out
  const currentBilling = getSubscription(user)?.billing;

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex justify-center mb-12">
        <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-full bg-ink-50 p-1 ring-1 ring-ink-900/5">
          {(["annual", "monthly"] as Billing[]).map((b) => (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={billing === b}
              onClick={() => setBilling(b)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                billing === b ? "bg-ink-900 text-white" : "text-ink-500 hover:text-ink-900"
              }`}
            >
              {b === "annual" ? "Yearly" : "Monthly"}
              {b === "annual" && (
                <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${billing === b ? "bg-sun-500 text-ink-900" : "bg-sun-300/60 text-ink-900"}`}>
                  Save up to {maxSavingsPct()}%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        {signupPlans.map((p) => {
          const price = priceFor(p, billing);
          const featured = Boolean(p.badge);
          const isCurrent = current === p.id && (p.monthly === 0 || currentBilling === billing || !currentBilling);
          const isCurrentPlanOtherBilling = current === p.id && !isCurrent;

          // What the button does
          let cta: React.ReactNode;
          const btn = `w-full rounded-full px-6 py-3 text-center font-bold transition-colors ${
            featured ? "bg-sun-500 hover:bg-sun-600 text-ink-900" : "bg-ink-900 hover:bg-ink-800 text-white"
          }`;
          if (isCurrent) {
            cta = (
              <Link href="/account" className={`w-full rounded-full px-6 py-3 text-center font-bold ring-2 ${featured ? "ring-sun-400 text-sun-300" : "ring-ink-900 text-ink-900"}`}>
                ✓ Your plan
              </Link>
            );
          } else if (current === null) {
            // Signed out → sign up with this plan pre-selected
            cta = (
              <Link href={`/signup?plan=${p.id}${p.monthly && billing === "monthly" ? "&billing=monthly" : ""}`} className={btn}>
                {p.cta}
              </Link>
            );
          } else if (p.monthly === 0) {
            // Paying member looking at the free plan → cancel via billing portal
            cta = (
              <Link href="/account" className="w-full rounded-full px-6 py-3 text-center font-bold ring-2 ring-ink-200 text-ink-500 hover:ring-ink-900 hover:text-ink-900 transition-colors">
                Manage in account
              </Link>
            );
          } else {
            const label = isCurrentPlanOtherBilling
              ? `Switch to ${billing === "annual" ? "yearly" : "monthly"}`
              : current === "explorer"
              ? p.cta
              : RANK[p.id] > RANK[current]
              ? `Upgrade to ${p.name}`
              : `Switch to ${p.name}`;
            cta = (
              <form action="/api/stripe/checkout" method="post">
                <input type="hidden" name="plan" value={p.id} />
                <input type="hidden" name="billing" value={billing} />
                <button type="submit" className={btn}>
                  {label}
                </button>
              </form>
            );
          }

          return (
            <div
              key={p.id}
              className={`relative rounded-3xl p-8 flex flex-col ${
                featured ? "bg-ink-900 text-white shadow-2xl shadow-ink-900/30 md:-translate-y-3" : "bg-ink-50 text-ink-900"
              } ${isCurrent ? "ring-4 ring-sun-400" : ""}`}
            >
              {(p.badge || isCurrent) && (
                <span className="absolute -top-3 left-8 rounded-full bg-sun-500 px-3 py-1 text-xs font-extrabold tracking-wider text-ink-900">
                  {isCurrent ? "YOUR PLAN" : p.badge}
                </span>
              )}
              <h3 className="text-lg font-bold mb-1">{p.name}</h3>
              <p className={`text-sm mb-6 ${featured ? "text-white/70" : "text-ink-500"}`}>{p.blurb}</p>
              <p className="mb-1">
                {price.was && <span className={`mr-2 text-xl font-bold line-through ${featured ? "text-white/40" : "text-ink-400"}`}>{price.was}</span>}
                <span className="text-4xl font-extrabold font-display">{price.main}</span>
                <span className={featured ? "text-white/60" : "text-ink-500"}> {price.sub}</span>
              </p>
              <p className={`text-sm font-semibold mb-6 min-h-5 ${featured ? "text-sun-400" : "text-emerald-700"}`}>{price.note}</p>
              {p.includesLabel && <p className={`text-sm font-bold mb-3 ${featured ? "text-white" : "text-ink-900"}`}>{p.includesLabel}</p>}
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <CheckIcon className={`w-5 h-5 shrink-0 ${featured ? "text-sun-400" : "text-emerald-600"}`} />
                    <span className={featured ? "text-white/90" : "text-ink-700"}>{f}</span>
                  </li>
                ))}
              </ul>
              {cta}
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-ink-500">
        Rather have an expert do it? <span className="font-semibold text-ink-900">Concierge</span> bookings start at ${conciergeFromPrice} per trip.{" "}
        <a href="#concierge" className="font-bold text-sun-600 hover:text-ink-900">Learn more</a>
      </p>
    </div>
  );
}
