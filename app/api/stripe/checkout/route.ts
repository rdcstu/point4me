// POST /api/stripe/checkout  (form fields: plan, billing)
// Starts a Stripe Checkout session for a paid plan and sends the browser there.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, getPriceId, isPaidPlan, syncSubscription, type Billing } from "@/lib/stripe";
import { activePlan, getSubscription } from "@/lib/entitlements";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const form = await request.formData();
  const plan = String(form.get("plan") ?? "");
  const billing: Billing = form.get("billing") === "monthly" ? "monthly" : "annual";

  if (!isPaidPlan(plan)) return NextResponse.redirect(`${origin}/signup#plans`, { status: 303 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/signup?plan=${plan}`, { status: 303 });
  }

  // Already paying? Switch the existing subscription instead of starting a second one.
  const current = activePlan(user);
  if (current) {
    const sub = getSubscription(user)!;
    if (current === plan && sub.billing === billing) return NextResponse.redirect(`${origin}/account`, { status: 303 });
    try {
      const s = stripe();
      const existing = await s.subscriptions.retrieve(sub.id);
      const updated = await s.subscriptions.update(sub.id, {
        items: [{ id: existing.items.data[0].id, price: await getPriceId(plan, billing) }],
        proration_behavior: "create_prorations", // charge/credit the difference
        cancel_at_period_end: false,
        metadata: { ...existing.metadata, plan },
      });
      await syncSubscription(updated);
      return NextResponse.redirect(`${origin}/account?checkout=success`, { status: 303 });
    } catch (err) {
      console.error("Stripe plan change failed:", err);
      const msg = err instanceof Error ? err.message : "Plan change failed";
      return NextResponse.redirect(`${origin}/account?checkout=error&message=${encodeURIComponent(msg)}`, { status: 303 });
    }
  }

  try {
    const s = stripe();
    const price = await getPriceId(plan, billing);
    const existingCustomer = (user.app_metadata as { stripe_customer_id?: string }).stripe_customer_id;

    const session = await s.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      ...(existingCustomer ? { customer: existingCustomer } : { customer_email: user.email }),
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id, plan },
      subscription_data: { metadata: { supabase_user_id: user.id, plan } },
      allow_promotion_codes: true,
      success_url: `${origin}/api/stripe/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/account?checkout=cancelled`,
    });

    return NextResponse.redirect(session.url!, { status: 303 });
  } catch (err) {
    console.error("Stripe checkout failed:", err);
    const msg = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.redirect(`${origin}/account?checkout=error&message=${encodeURIComponent(msg)}`, { status: 303 });
  }
}
