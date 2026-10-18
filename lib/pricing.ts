// One place to turn plan prices (from lib/site.ts) into display text.
// Used by the home page, sign-up page, account page and paywall so they always agree.
import { signupPlans, type SignupPlan } from "@/lib/site";

export type Billing = "monthly" | "annual";

/** Percent saved by paying yearly instead of 12 monthly payments. */
export function savingsPct(plan: SignupPlan) {
  return plan.monthly ? Math.round((1 - plan.annual / (plan.monthly * 12)) * 100) : 0;
}

/** Largest yearly saving across all plans, for the "Save up to X%" toggle. */
export function maxSavingsPct() {
  return Math.max(...signupPlans.map(savingsPct));
}

function money(n: number) {
  return `$${n % 1 === 0 ? n : n.toFixed(2)}`;
}

/** Headline price for a card: { main: "$12", sub: "/month", note: "Billed $144 yearly · save 40%" } */
export function priceFor(plan: SignupPlan, billing: Billing) {
  if (plan.monthly === 0) return { main: "Free", sub: "forever", note: "", was: "" };
  if (billing === "monthly") return { main: money(plan.monthly), sub: "/month", note: "Billed monthly", was: "" };
  return {
    main: money(plan.annual / 12),
    sub: "/month",
    note: `Billed ${money(plan.annual)} yearly · save ${savingsPct(plan)}%`,
    was: money(plan.monthly), // crossed-out monthly price
  };
}

/** Short label like "$20/month" or "$144/year". */
export function priceLabel(planId: string, billing: string) {
  const p = signupPlans.find((x) => x.id === planId);
  if (!p || !p.monthly) return "Free";
  return billing === "monthly" ? `${money(p.monthly)}/month` : `${money(p.annual)}/year`;
}
