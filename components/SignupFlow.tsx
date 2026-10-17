"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, enabledProviders } from "@/lib/supabase/client";
import { signupPlans, type SignupPlan } from "@/lib/site";
import { CheckIcon, ArrowRightIcon, BoltIcon, GoogleIcon, AppleIcon } from "./Icons";

// ============================================================
// SIGN-UP FLOW — creates real accounts with Supabase Auth.
// Step 1: pick a plan (monthly / annual toggle)
// Step 2: create an account (Google, Apple, or email + password)
// The chosen plan is saved on the account; no payment is collected yet.
// ============================================================

type Billing = "annual" | "monthly";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-base text-ink-900 placeholder:text-ink-400 focus:border-sun-500 focus:outline-none focus:ring-4 focus:ring-sun-300/40";
const labelClass = "block text-sm font-semibold text-ink-700 mb-1.5";

function priceFor(plan: SignupPlan, billing: Billing) {
  if (plan.monthly === 0) return { main: "Free", sub: "forever", note: "" };
  if (billing === "monthly") return { main: `$${plan.monthly}`, sub: "/month", note: "Billed monthly" };
  const perMonth = plan.annual / 12;
  const full = plan.monthly * 12;
  const savePct = Math.round((1 - plan.annual / full) * 100);
  return {
    main: `$${perMonth % 1 === 0 ? perMonth : perMonth.toFixed(2)}`,
    sub: "/month",
    note: `Billed $${plan.annual} yearly · save ${savePct}%`,
  };
}

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Too short", "Weak", "Okay", "Good", "Strong"];
  const colors = ["bg-rose-500", "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];
  return { score, label: labels[score], color: colors[score] };
}

export function SignupFlow({ siteName }: { siteName: string }) {
  const [billing, setBilling] = useState<Billing>("annual");
  const [planId, setPlanId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [providerNote, setProviderNote] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const accountRef = useRef<HTMLElement>(null);

  // Pre-select a plan from ?plan=member links on the home page
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("plan");
    if (p && signupPlans.some((x) => x.id === p)) setPlanId(p);
    // Already signed in? Then picking a paid plan goes straight to payment.
    createClient()
      .auth.getUser()
      .then(({ data }) => setSignedInEmail(data.user?.email ?? null));
  }, []);

  const choose = (id: string) => {
    setPlanId(id);
    setDone(false);
    setError(null);
    setProviderNote(null);
    requestAnimationFrame(() => accountRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const plan = signupPlans.find((p) => p.id === planId) ?? null;
  const strength = passwordStrength(password);
  const canSubmit = name.trim() && email && password.length >= 8 && agree;

  async function social(provider: "google" | "apple") {
    const label = provider === "google" ? "Google" : "Apple";
    if (!enabledProviders().includes(provider)) return setProviderNote(label);
    setProviderNote(null);
    const { error } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/account` },
    });
    if (error) setError(error.message);
  }

  return (
    <>
      {/* ============================================================ */}
      {/* PLANS                                                        */}
      {/* ============================================================ */}
      <section id="plans" className="py-16 md:py-20 bg-ink-50 scroll-mt-4">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-ink-900 mb-3">Choose your plan</h2>
            <p className="text-ink-500 text-lg">One award booking can pay for a whole year of membership.</p>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-10">
            <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-full bg-white p-1 ring-1 ring-ink-900/5 shadow-sm">
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
                      Save up to 33%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Plan cards — paid plans first, free last, like the reference */}
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {[...signupPlans.slice(1), signupPlans[0]].map((p) => {
              const price = priceFor(p, billing);
              const featured = Boolean(p.badge);
              const selected = planId === p.id;
              return (
                <div
                  key={p.id}
                  className={`relative rounded-3xl p-7 flex flex-col transition-shadow ${
                    featured ? "bg-ink-900 text-white shadow-2xl shadow-ink-900/30" : "bg-white text-ink-900 ring-1 ring-ink-900/5"
                  } ${selected ? "ring-4 ring-sun-400" : ""}`}
                >
                  {p.badge && (
                    <span className="absolute -top-3 left-7 rounded-full bg-sun-500 px-3 py-1 text-xs font-extrabold tracking-wider text-ink-900">
                      {p.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-bold font-display mb-1">{p.name}</h3>
                  <p className={`text-sm mb-6 ${featured ? "text-white/70" : "text-ink-500"}`}>{p.blurb}</p>

                  <p className="mb-1">
                    <span className="text-4xl font-extrabold font-display">{price.main}</span>
                    <span className={featured ? "text-white/60" : "text-ink-500"}> {price.sub}</span>
                  </p>
                  <p className={`text-sm mb-6 min-h-5 ${featured ? "text-sun-400 font-semibold" : "text-emerald-700 font-semibold"}`}>
                    {price.note}
                  </p>

                  {p.includesLabel && (
                    <p className={`text-sm font-bold mb-3 ${featured ? "text-white" : "text-ink-900"}`}>{p.includesLabel}</p>
                  )}
                  <ul className="space-y-3 mb-8 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <CheckIcon className={`w-5 h-5 shrink-0 ${featured ? "text-sun-400" : "text-emerald-600"}`} />
                        <span className={featured ? "text-white/90" : "text-ink-700"}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => choose(p.id)}
                    aria-pressed={selected}
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-bold transition-colors ${
                      featured
                        ? "bg-sun-500 hover:bg-sun-600 text-ink-900"
                        : p.monthly === 0
                        ? "bg-white text-ink-900 ring-2 ring-ink-900 hover:bg-ink-50"
                        : "bg-ink-900 hover:bg-ink-800 text-white"
                    }`}
                  >
                    {selected ? "Selected ✓" : p.cta}
                    {!selected && <ArrowRightIcon className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Concierge — "more options" */}
          <div className="mt-6 rounded-3xl bg-white ring-1 ring-ink-900/5 p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-5 justify-between">
            <div className="flex items-start gap-4">
              <span className="h-12 w-12 shrink-0 rounded-2xl bg-sun-500 text-ink-900 flex items-center justify-center">
                <BoltIcon className="w-6 h-6" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-1">More options</p>
                <h3 className="text-lg font-bold text-ink-900">Concierge — from $150 per trip</h3>
                <p className="text-ink-500">Our experts find the flights and walk you through the transfers and booking.</p>
              </div>
            </div>
            <Link href="/#pricing" className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full ring-2 ring-ink-900 px-6 py-3 font-bold text-ink-900 hover:bg-ink-50 transition-colors">
              Learn more <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CREATE ACCOUNT                                               */}
      {/* ============================================================ */}
      <section ref={accountRef} id="account" className="py-16 md:py-20 bg-white scroll-mt-4" aria-live="polite">
        <div className="container mx-auto px-4 md:px-6 max-w-md">
          {plan && signedInEmail ? (
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-ink-900 mb-2">
                {plan.monthly ? `Subscribe to ${plan.name}` : "You're all set"}
              </h2>
              <p className="text-ink-500 mb-6">
                Signed in as <span className="font-semibold text-ink-900">{signedInEmail}</span>.
              </p>
              {plan.monthly ? (
                <form action="/api/stripe/checkout" method="post">
                  <input type="hidden" name="plan" value={plan.id} />
                  <input type="hidden" name="billing" value={billing} />
                  <button type="submit" className="w-full rounded-full bg-sun-500 hover:bg-sun-600 px-6 py-3.5 text-base font-bold text-ink-900 transition-colors">
                    Continue to payment · {priceFor(plan, billing).main}
                    {priceFor(plan, billing).sub}
                  </button>
                  <p className="mt-3 text-xs text-ink-400">{priceFor(plan, billing).note || "Billed monthly"}. Secure payment by Stripe. Cancel anytime.</p>
                </form>
              ) : (
                <Link href="/account" className="inline-block rounded-full bg-sun-500 hover:bg-sun-600 px-7 py-3.5 font-bold text-ink-900 transition-colors">
                  Go to my account
                </Link>
              )}
            </div>
          ) : !plan ? (
            <div className="text-center rounded-3xl border-2 border-dashed border-ink-200 p-8">
              <h2 className="text-2xl font-bold font-display text-ink-900 mb-2">Create your account</h2>
              <p className="text-ink-500 mb-5">Pick a plan above to get started. You can change it any time.</p>
              <button type="button" onClick={() => choose("explorer")} className="font-bold text-sun-600 hover:text-ink-900">
                Or just start with the free plan →
              </button>
            </div>
          ) : done ? (
            <div className="text-center" role="status">
              <span className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckIcon className="w-7 h-7" />
              </span>
              <h2 className="text-2xl font-extrabold font-display text-ink-900 mb-2">
                Check your email{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}
              </h2>
              <p className="text-ink-500 mb-6">
                We sent a confirmation link to <span className="font-semibold text-ink-900">{email}</span>. Click it to finish creating your {plan.name} account. It may take a minute to arrive, so check your spam folder too.
              </p>
              <Link href="/login" className="inline-block rounded-full bg-sun-500 hover:bg-sun-600 px-7 py-3.5 font-bold text-ink-900 transition-colors">
                Go to log in
              </Link>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!canSubmit || busy) return;
                setBusy(true);
                setError(null);
                const { data, error } = await createClient().auth.signUp({
                  email,
                  password,
                  options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
                    data: { full_name: name.trim(), plan: plan.id, billing, newsletter },
                  },
                });
                setBusy(false);
                if (error) {
                  const m = error.message.toLowerCase();
                  setError(
                    m.includes("already registered")
                      ? "An account with this email already exists. Log in instead?"
                      : m.includes("rate limit")
                      ? "Too many sign-up emails were sent recently. Please wait a few minutes and try again."
                      : m.includes("password")
                      ? error.message
                      : `Sign-up failed: ${error.message}`
                  );
                  return;
                }
                setPassword("");
                if (data.session) {
                  // Email confirmation is off: they're signed in already
                  router.replace("/account");
                  router.refresh();
                } else {
                  setDone(true);
                }
              }}
              aria-label="Create your account"
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-ink-900 text-center mb-2">Create your account</h2>

              {/* Selected plan summary */}
              <div className="my-6 flex items-center justify-between gap-3 rounded-2xl bg-ink-50 px-4 py-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-ink-400">Your plan</p>
                  <p className="font-bold text-ink-900">
                    {plan.name}{" "}
                    <span className="font-semibold text-ink-500">
                      · {priceFor(plan, billing).main}
                      {plan.monthly ? priceFor(plan, billing).sub : ""}
                      {plan.monthly && billing === "annual" ? " billed yearly" : ""}
                    </span>
                  </p>
                </div>
                <a href="#plans" className="text-sm font-bold text-sun-600 hover:text-ink-900">Change</a>
              </div>

              {/* Social sign-up */}
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => social("google")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-3 font-semibold text-ink-900 hover:bg-ink-50 transition-colors"
                >
                  <GoogleIcon /> Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => social("apple")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-950 px-4 py-3 font-semibold text-white hover:bg-ink-800 transition-colors"
                >
                  <AppleIcon /> Continue with Apple
                </button>
              </div>
              {providerNote && (
                <p role="status" className="mt-3 text-sm text-ink-500 text-center">
                  {providerNote} sign-up isn&apos;t switched on yet. Use your email below.
                </p>
              )}

              <div className="my-6 flex items-center gap-4 text-sm text-ink-400" aria-hidden="true">
                <span className="h-px flex-1 bg-ink-100" /> or use your email <span className="h-px flex-1 bg-ink-100" />
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="su-name" className={labelClass}>Full name</label>
                  <input id="su-name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="su-email" className={labelClass}>Email</label>
                  <input id="su-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="su-password" className={labelClass}>Password</label>
                  <div className="relative">
                    <input
                      id="su-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-describedby="su-password-hint"
                      className={`${inputClass} pr-16`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-sm font-semibold text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-3" id="su-password-hint">
                    <div className="flex flex-1 gap-1" aria-hidden="true">
                      {[0, 1, 2, 3].map((i) => (
                        <span key={i} className={`h-1.5 flex-1 rounded-full ${password && i < strength.score ? strength.color : "bg-ink-100"}`} />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-ink-500 w-16 text-right">
                      {password ? strength.label : "8+ chars"}
                    </span>
                  </div>
                </div>

                <label className="flex items-start gap-3 text-sm text-ink-700 cursor-pointer">
                  <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#ffb627]" />
                  Send me the weekly award deals email
                </label>
                <label className="flex items-start gap-3 text-sm text-ink-700 cursor-pointer">
                  <input type="checkbox" required checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#ffb627]" />
                  I agree to the {siteName} Terms of Service and Privacy Policy
                </label>
              </div>

              {error && (
                <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit || busy}
                className="mt-6 w-full rounded-full bg-sun-500 hover:bg-sun-600 px-6 py-3.5 text-base font-bold text-ink-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? "Creating account…" : plan.monthly === 0 ? "Create free account" : "Create account"}
              </button>
              {plan.monthly > 0 && (
                <p className="mt-3 text-center text-xs text-ink-400">After you confirm your email, you&apos;ll subscribe from your account page. Secure payment by Stripe.</p>
              )}

              <p className="mt-6 text-center text-sm text-ink-500">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-ink-900 hover:text-sun-600">Log in</Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
