// POST /api/stripe/portal — opens Stripe's billing portal (change plan, update card, cancel).
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login?next=/account`, { status: 303 });

  const customer = (user.app_metadata as { stripe_customer_id?: string }).stripe_customer_id;
  if (!customer) return NextResponse.redirect(`${origin}/account`, { status: 303 });

  try {
    const portal = await stripe().billingPortal.sessions.create({ customer, return_url: `${origin}/account` });
    return NextResponse.redirect(portal.url, { status: 303 });
  } catch (err) {
    console.error("Stripe portal failed:", err);
    const msg = err instanceof Error ? err.message : "Could not open billing portal";
    return NextResponse.redirect(`${origin}/account?checkout=error&message=${encodeURIComponent(msg)}`, { status: 303 });
  }
}
