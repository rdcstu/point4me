// What a signed-in user has paid for.
// Billing info lives in Supabase app_metadata, which only the server
// (with the secret key) can change — visitors can't edit it themselves.
import type { User } from "@supabase/supabase-js";

export type PaidPlanId = "member" | "plus";

export type Subscription = {
  id: string; // Stripe subscription id
  plan: PaidPlanId;
  billing: "monthly" | "annual";
  status: string; // Stripe status: active, trialing, past_due, canceled, ...
  current_period_end: number | null; // unix seconds
  cancel_at_period_end: boolean;
};

const ACTIVE = ["active", "trialing", "past_due"]; // past_due = grace while Stripe retries the card

export function getSubscription(user: User | null): Subscription | null {
  const sub = (user?.app_metadata as { subscription?: Subscription } | undefined)?.subscription;
  return sub ?? null;
}

/** Paid plan the user currently has access to, or null for free (Explorer). */
export function activePlan(user: User | null): PaidPlanId | null {
  const sub = getSubscription(user);
  return sub && ACTIVE.includes(sub.status) ? sub.plan : null;
}

const RANK: Record<string, number> = { explorer: 0, member: 1, plus: 2 };

/** True if the user's active plan is at least `required`. */
export function hasPlan(user: User | null, required: PaidPlanId) {
  return RANK[activePlan(user) ?? "explorer"] >= RANK[required];
}
