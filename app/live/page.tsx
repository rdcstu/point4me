import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isOwner } from "@/lib/owner";
import { LiveSearch } from "@/components/LiveSearch";
import { PlaneIcon } from "@/components/Icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Live Data — ${site.name}`,
  robots: { index: false, follow: false },
};

// Private page: live award search through the owner's own PointsYeah membership.
export default async function LiveDataPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/live");
  const owner = isOwner(user);

  return (
    <>
      <header className="bg-ink-900 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2" aria-label={`${site.name} home`}>
            <span className="h-8 w-8 rounded-full bg-sun-500 flex items-center justify-center text-ink-900">
              <PlaneIcon className="w-4 h-4 -rotate-45" />
            </span>
            <span className="text-base sm:text-xl font-extrabold tracking-tight font-display text-white whitespace-nowrap">{site.name}</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-white/90 hover:text-sun-400 whitespace-nowrap">← Home</Link>
        </div>
      </header>

      <main id="main-content" className="min-h-[calc(100vh-4rem)] bg-ink-50 py-10 md:py-14">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          {owner ? (
            <>
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold tracking-wider text-emerald-800 mb-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" /> LIVE · PRIVATE
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold font-display text-ink-900 mb-2">Live award search</h1>
                <p className="text-ink-500">
                  Award seats from your PointsYeah membership, covering roughly the next two months. Only you can see this page.
                </p>
              </div>
              <LiveSearch inPage={Boolean(process.env.POINTSYEAH_API_KEY?.trim())} />
            </>
          ) : (
            <div className="text-center rounded-3xl bg-white ring-1 ring-ink-900/5 p-10">
              <h1 className="text-2xl font-extrabold font-display text-ink-900 mb-2">This page is private</h1>
              <p className="text-ink-500 mb-6">Live data isn&apos;t available on your account.</p>
              <Link href="/" className="inline-block rounded-full bg-sun-500 hover:bg-sun-600 px-6 py-3 font-bold text-ink-900">Back home</Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
