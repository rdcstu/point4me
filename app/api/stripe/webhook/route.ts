// POST /api/stripe/webhook — Stripe tells us about renewals, plan changes,
// failed payments and cancellations. Signature-checked with STRIPE_WEBHOOK_SECRET.
import type Stripe from "stripe";
import { stripe, syncSubscription } from "@/lib/stripe";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response("STRIPE_WEBHOOK_SECRET is not set", { status: 500 });

  const body = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (typeof session.subscription === "string") {
          await syncSubscription(await stripe().subscriptions.retrieve(session.subscription));
        }
        break;
      }
    }
  } catch (err) {
    console.error(`Webhook ${event.type} failed:`, err);
    return new Response("Handler error", { status: 500 }); // Stripe will retry
  }

  return Response.json({ received: true });
}
