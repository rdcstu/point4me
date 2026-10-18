import Link from "next/link";
import { signupPlans } from "@/lib/site";
import type { PaidPlanId } from "@/lib/entitlements";
import { priceFor } from "@/lib/pricing";

// Shown in place of content the visitor's plan doesn't include.
// Usage: {hasPlan(user, "member") ? <Content /> : <Paywall required="member" signedIn={!!user} />}

export function Paywall({ required, signedIn, title }: { required: PaidPlanId; signedIn: boolean; title?: string }) {
  const plan = signupPlans.find((p) => p.id === required)!;
  return (
    <div className="rounded-3xl bg-ink-900 text-white p-8 text-center">
      <span className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-sun-500 text-ink-900 flex items-center justify-center" aria-hidden="true">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </span>
      <h3 className="text-xl font-bold font-display mb-2">{title ?? `Included with ${plan.name}`}</h3>
      <p className="text-white/70 mb-6 max-w-md mx-auto">
        Upgrade to {plan.name} from {priceFor(plan, "annual").main}/month (billed yearly) to unlock this.
      </p>
      {signedIn ? (
        <form action="/api/stripe/checkout" method="post" className="inline-block">
          <input type="hidden" name="plan" value={required} />
          <input type="hidden" name="billing" value="annual" />
          <button type="submit" className="rounded-full bg-sun-500 hover:bg-sun-600 px-7 py-3 font-bold text-ink-900 transition-colors">
            Upgrade to {plan.name}
          </button>
        </form>
      ) : (
        <Link href={`/signup?plan=${required}`} className="inline-block rounded-full bg-sun-500 hover:bg-sun-600 px-7 py-3 font-bold text-ink-900 transition-colors">
          Sign up for {plan.name}
        </Link>
      )}
      <p className="mt-4 text-sm text-white/60">
        <Link href="/signup#plans" className="underline underline-offset-2 hover:text-white">Compare plans</Link>
      </p>
    </div>
  );
}
