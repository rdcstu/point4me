import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Paywall } from "@/components/Paywall";
import { PlaneIcon } from "@/components/Icons";
import { site, deals } from "@/lib/site";
import { hasPlan } from "@/lib/entitlements";

export const metadata: Metadata = {
  title: `Members area — ${site.name}`,
};

const fmt = new Intl.NumberFormat("en-US");

export default async function MembersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isMember = hasPlan(user, "member");
  const isPlus = hasPlan(user, "plus");

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
          <Link href={user ? "/account" : "/login?next=/members"} className="text-sm font-bold text-white/90 hover:text-sun-400">
            {user ? "My account" : "Log in"}
          </Link>
        </div>
      </header>

      <main id="main-content" className="min-h-[calc(100vh-4rem)] bg-ink-50 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl space-y-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-display text-ink-900 mb-2">Members area</h1>
            <p className="text-ink-500">Full deal details and booking steps for paying members.</p>
          </div>

          {/* ---------- Member tier ---------- */}
          <section aria-labelledby="deals-heading">
            <h2 id="deals-heading" className="text-xl font-bold text-ink-900 mb-4">All award deals with booking steps</h2>
            {isMember ? (
              <div className="grid md:grid-cols-2 gap-4">
                {deals.map((d) => (
                  <article key={`${d.fromCode}-${d.toCode}`} className="rounded-2xl bg-white ring-1 ring-ink-900/5 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-ink-900">
                        {d.from} → {d.to}
                      </p>
                      <span className="rounded-full bg-ink-50 px-2.5 py-0.5 text-xs font-semibold text-ink-700">{d.cabin}</span>
                    </div>
                    <p className="text-ink-900 font-semibold mb-3">
                      {fmt.format(d.points)} pts + ${d.taxes} <span className="text-ink-400 font-normal">vs ${fmt.format(d.cashPrice)}</span>
                    </p>
                    <ol className="list-decimal pl-5 space-y-1 text-sm text-ink-500">
                      <li>Check you hold enough points with a card that transfers to the {d.program.toLowerCase()}.</li>
                      <li>Confirm the seat is still available on the program&apos;s site before transferring.</li>
                      <li>Transfer {fmt.format(d.points)} points (transfers are usually instant but can&apos;t be undone).</li>
                      <li>Book {d.fromCode} → {d.toCode} and pay ${d.taxes} in taxes and fees.</li>
                    </ol>
                  </article>
                ))}
              </div>
            ) : (
              <Paywall required="member" signedIn={Boolean(user)} title="Unlock every deal and how to book it" />
            )}
          </section>

          {/* ---------- Member Plus tier ---------- */}
          <section aria-labelledby="plus-heading">
            <h2 id="plus-heading" className="text-xl font-bold text-ink-900 mb-4">Points strategy session</h2>
            {isPlus ? (
              <div className="rounded-3xl bg-white ring-1 ring-ink-900/5 p-6 md:p-8">
                <p className="text-ink-700 mb-4">
                  Your Member Plus plan includes a free 30-minute session with a points expert to plan how to earn and use your points.
                </p>
                <p className="text-sm text-ink-500">Booking for sessions opens soon. We&apos;ll email you when it&apos;s ready.</p>
              </div>
            ) : (
              <Paywall required="plus" signedIn={Boolean(user)} title="Included with Member Plus" />
            )}
          </section>
        </div>
      </main>
    </>
  );
}
