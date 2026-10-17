import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChangePassword } from "@/components/ChangePassword";
import { PlaneIcon } from "@/components/Icons";
import { site, signupPlans } from "@/lib/site";

export const metadata: Metadata = {
  title: `My account — ${site.name}`,
};

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const meta = (user.user_metadata ?? {}) as { full_name?: string; plan?: string; billing?: string; newsletter?: boolean };
  const plan = signupPlans.find((p) => p.id === meta.plan) ?? signupPlans[0];
  const firstName = meta.full_name?.trim().split(" ")[0];
  const provider = (user.app_metadata?.provider as string | undefined) ?? "email";

  const rows = [
    { label: "Name", value: meta.full_name || "—" },
    { label: "Email", value: user.email ?? "—" },
    { label: "Plan", value: `${plan.name}${plan.monthly ? ` · billed ${meta.billing === "monthly" ? "monthly" : "yearly"}` : " · free"}` },
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
            {plan.monthly > 0 && (
              <p className="mt-4 rounded-xl bg-sun-300/30 px-4 py-3 text-sm text-ink-800">
                Payments aren&apos;t set up yet, so your {plan.name} plan is saved but not billed.
              </p>
            )}
          </section>

          <section className="rounded-3xl bg-white ring-1 ring-ink-900/5 p-6 md:p-8 mb-6" aria-labelledby="password-heading">
            <h2 id="password-heading" className="text-lg font-bold text-ink-900 mb-1">Password</h2>
            <p className="text-sm text-ink-500 mb-4">Set or change the password you use to log in.</p>
            <ChangePassword />
          </section>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="inline-flex justify-center rounded-full bg-sun-500 hover:bg-sun-600 px-7 py-3.5 font-bold text-ink-900 transition-colors">
              Search award flights
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
