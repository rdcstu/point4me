import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChangePassword } from "@/components/ChangePassword";
import { CheckIcon, PlaneIcon } from "@/components/Icons";
import { site, signupPlans } from "@/lib/site";
import { activePlan, getSubscription } from "@/lib/entitlements";

export const metadata: Metadata = {
  title: `My account — ${site.name}`,
};

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

function priceLabel(planId: string, billing: string) {
  const p = signupPlans.find((x) => x.id === planId);
  if (!p || !p.monthly) return "";
  return billing === "monthly" ? `$${p.monthly}/month` : `$${p.annual}/year`;
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; message?: string }>;
}) {
  const { checkout, message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const meta = (user.user_metadata ?? {}) as { full_name?: string; plan?: string; billing?: string; newsletter?: boolean };
  const firstName = meta.full_name?.trim().split(" ")[0];
  const provider = (user.app_metadata?.provider as string | undefined) ?? "email";

  // What they pay for (set by the server from Stripe) vs. what they picked at sign-up
  const sub = getSubscription(user);
  const paidPlanId = activePlan(user);
  const currentPlan = signupPlans.find((p) => p.id === (paidPlanId ?? "explorer"))!;
  const wanted = signupPlans.find((p) => p.id === meta.plan);
  const pendingPlan = !paidPlanId && wanted && wanted.monthly > 0 ? wanted : null;
  const pendingBilling = meta.billing === "monthly" ? "monthly" : "annual";
  const hasCustomer = Boolean((user.app_metadata as { stripe_customer_id?: string }).stripe_customer_id);

  const rows = [
    { label: "Name", value: meta.full_name || "—" },
    { label: "Email", value: user.email ?? "—" },
    { label: "Weekly deals email", value: meta.newsletter === false ? "Off" : "On" },
    { label: "Signed in with", value: provider === "email" ? "Email" : provider.charAt(0).toUpperCase() + provider.slice(1) },
    { label: "Member since", value: dateFmt.format(new Date(user.created_at)) },
  ];

  return (
    <>
      <header className="bg-ink-900 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2" aria-label={`${site.name} home`}>
            <span className="h-8 w-8 rounded-full bg-sun-500 flex items-center justify-center text-ink-900">
              <PlaneIcon className="w-4 h-4 -rotate-45" />
            </span>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight font-display text-white">{site.name}</span>
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-sm font-bold text-white/90 hover:text-sun-400">
              Log out
            </button>
          </form>
        </div>
      </header>

      <main id="main-content" className="min-h-[calc(100vh-4rem)] bg-ink-50 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold font-display text-ink-900 mb-2">
            {firstName ? `Hi, ${firstName}` : "Your account"}
          </h1>
          <p className="text-ink-500 mb-8">You&apos;re signed in. Here&apos;s what we have on file.</p>

          {/* Checkout result banners */}
          {checkout === "success" && (
            <p role="status" className="mb-6 rounded-2xl bg-emerald-50 px-5 py-4 font-semibold text-emerald-800 ring-1 ring-emerald-200">
              {paidPlanId ? `You're now on ${currentPlan.name}. Thanks for subscribing!` : "Payment received. Your plan will show here in a moment — refresh if it doesn't."}
            </p>
          )}
          {checkout === "cancelled" && (
            <p role="status" className="mb-6 rounded-2xl bg-white px-5 py-4 font-semibold text-ink-700 ring-1 ring-ink-200">
              Checkout cancelled. You haven&apos;t been charged.
            </p>
          )}
          {checkout === "error" && (
            <p role="alert" className="mb-6 rounded-2xl bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
              Something went wrong with billing: {message ?? "unknown error"}
            </p>
          )}

          {/* ============ PLAN & BILLING ============ */}
          <section className="rounded-3xl bg-white ring-1 ring-ink-900/5 p-6 md:p-8 mb-6" aria-labelledby="plan-heading">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 id="plan-heading" className="text-lg font-bold text-ink-900">Your plan</h2>
                <p className="text-2xl font-extrabold font-display text-ink-900 mt-1">{currentPlan.name}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold tracking-wider ${
                  paidPlanId ? "bg-emerald-100 text-emerald-800" : "bg-ink-100 text-ink-700"
                }`}
              >
                {paidPlanId ? (sub?.status === "past_due" ? "PAYMENT DUE" : "ACTIVE") : "FREE"}
              </span>
            </div>

            {paidPlanId && sub && (
              <>
                <p className="text-ink-500 mb-5">
                  {priceLabel(sub.plan, sub.billing)}
                  {sub.current_period_end && (
                    <>
                      {" · "}
                      {sub.cancel_at_period_end ? "Ends on " : "Renews on "}
                      {dateFmt.format(new Date(sub.current_period_end * 1000))}
                    </>
                  )}
                </p>
                {sub.status === "past_due" && (
                  <p className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                    Your last payment didn&apos;t go through. Update your card to keep your plan.
                  </p>
                )}
                <form action="/api/stripe/portal" method="post">
                  <button type="submit" className="rounded-full bg-ink-900 hover:bg-ink-800 px-6 py-3 font-bold text-white transition-colors">
                    Manage billing
                  </button>
                </form>
                <p className="mt-3 text-xs text-ink-400">Change plan, update your card, see invoices or cancel.</p>
              </>
            )}

            {!paidPlanId && (
              <>
                <ul className="space-y-2 mb-5 text-sm text-ink-700">
                  {currentPlan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckIcon className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>

                {pendingPlan ? (
                  <div className="rounded-2xl bg-sun-300/30 p-5">
                    <p className="font-bold text-ink-900 mb-1">Finish setting up {pendingPlan.name}</p>
                    <p className="text-sm text-ink-700 mb-4">
                      You picked {pendingPlan.name} when you signed up. Subscribe to unlock it.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <form action="/api/stripe/checkout" method="post">
                        <input type="hidden" name="plan" value={pendingPlan.id} />
                        <input type="hidden" name="billing" value={pendingBilling} />
                        <button type="submit" className="w-full sm:w-auto rounded-full bg-sun-500 hover:bg-sun-600 px-6 py-3 font-bold text-ink-900 transition-colors">
                          Subscribe · {priceLabel(pendingPlan.id, pendingBilling)}
                        </button>
                      </form>
                      <Link href="/signup#plans" className="inline-flex justify-center rounded-full ring-2 ring-ink-900 px-6 py-3 font-bold text-ink-900 hover:bg-white transition-colors">
                        Compare plans
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Link href="/signup#plans" className="inline-flex rounded-full bg-sun-500 hover:bg-sun-600 px-6 py-3 font-bold text-ink-900 transition-colors">
                    Upgrade your plan
                  </Link>
                )}

                {hasCustomer && (
                  <form action="/api/stripe/portal" method="post" className="mt-4">
                    <button type="submit" className="text-sm font-semibold text-ink-500 hover:text-ink-900 underline underline-offset-2">
                      View past invoices
                    </button>
                  </form>
                )}
              </>
            )}
          </section>

          <section className="rounded-3xl bg-white ring-1 ring-ink-900/5 p-6 md:p-8 mb-6" aria-labelledby="details-heading">
            <h2 id="details-heading" className="text-lg font-bold text-ink-900 mb-4">Account details</h2>
            <dl className="divide-y divide-ink-100">
              {rows.map((r) => (
                <div key={r.label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-3">
                  <dt className="text-sm font-semibold text-ink-500">{r.label}</dt>
                  <dd className="font-semibold text-ink-900 break-all sm:text-right">{r.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-3xl bg-white ring-1 ring-ink-900/5 p-6 md:p-8 mb-6" aria-labelledby="password-heading">
            <h2 id="password-heading" className="text-lg font-bold text-ink-900 mb-1">Password</h2>
            <p className="text-sm text-ink-500 mb-4">Set or change the password you use to log in.</p>
            <ChangePassword />
          </section>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/members" className="inline-flex justify-center rounded-full bg-sun-500 hover:bg-sun-600 px-7 py-3.5 font-bold text-ink-900 transition-colors">
              Members area
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="w-full sm:w-auto rounded-full ring-2 ring-ink-900 px-7 py-3.5 font-bold text-ink-900 hover:bg-white transition-colors">
                Log out
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
