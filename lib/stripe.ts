// Server-only Stripe helpers.
import Stripe from "stripe";
import { signupPlans } from "@/lib/site";
import type { PaidPlanId, Subscription } from "@/lib/entitlements";
import { createAdminClient } from "@/lib/supabase/admin";

let client: Stripe | null = null;
export function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set in .env.local");
  return (client ??= new Stripe(key));
}

export type Billing = "monthly" | "annual";

export function isPaidPlan(id: string): id is PaidPlanId {
  return id === "member" || id === "plus";
}

/**
 * Finds the Stripe Price for a plan + billing period, creating the product
 * and price the first time. Prices come from lib/site.ts, and the lookup key
 * includes the amount, so changing a price in site.ts creates a new Stripe price.
 */
export async function getPriceId(planId: PaidPlanId, billing: Billing) {
  const plan = signupPlans.find((p) => p.id === planId);
  if (!plan) throw new Error(`Unknown plan ${planId}`);
  const amount = Math.round((billing === "monthly" ? plan.monthly : plan.annual) * 100);
  const interval = billing === "monthly" ? "month" : "year";
  const lookupKey = `${planId}_${billing}_${amount}`;

  const s = stripe();
  const existing = await s.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  if (existing.data[0]) return existing.data[0].id;

  // Reuse the product for this plan if we made one before
  const products = await s.products.search({ query: `metadata['plan_id']:'${planId}'`, limit: 1 }).catch(() => null);
  const product =
    products?.data[0] ??
    (await s.products.create({ name: plan.name, description: plan.blurb, metadata: { plan_id: planId } }));

  const price = await s.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: amount,
    recurring: { interval },
    lookup_key: lookupKey,
    metadata: { plan_id: planId, billing },
  });
  return price.id;
}

/** Copies a Stripe subscription's state onto the Supabase user (app_metadata). */
export async function syncSubscription(sub: Stripe.Subscription) {
  const userId = sub.metadata?.supabase_user_id;
  const plan = sub.metadata?.plan;
  if (!userId || !plan || !isPaidPlan(plan)) return;

  const item = sub.items?.data?.[0] as (Stripe.SubscriptionItem & { current_period_end?: number }) | undefined;
  const legacyEnd = (sub as unknown as { current_period_end?: number }).current_period_end;

  const subscription: Subscription = {
    id: sub.id,
    plan,
    billing: item?.price?.recurring?.interval === "year" ? "annual" : "monthly",
    status: sub.status,
    current_period_end: item?.current_period_end ?? legacyEnd ?? null,
    cancel_at_period_end: Boolean(sub.cancel_at_period_end),
  };

  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const { error } = await createAdminClient().auth.admin.updateUserById(userId, {
    app_metadata: { subscription, stripe_customer_id: customerId },
  });
  if (error) throw error;
}
