// GET /api/stripe/return?session_id=...
// Stripe sends people here after paying. We look up the session on the server
// (never trusting the URL alone) and record the subscription on their account.
// The webhook does the same thing, so this also works without webhooks set up.
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { stripe, syncSubscription } from "@/lib/stripe";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) return NextResponse.redirect(`${url.origin}/account`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
    if (user && session.client_reference_id === user.id && session.subscription && typeof session.subscription !== "string") {
      await syncSubscription(session.subscription as Stripe.Subscription);
    }
  } catch (err) {
    console.error("Stripe return sync failed:", err);
  }
  return NextResponse.redirect(`${url.origin}/account?checkout=success`);
}
