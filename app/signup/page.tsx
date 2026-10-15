import type { Metadata } from "next";
import Link from "next/link";
import { SignupFlow } from "@/components/SignupFlow";
import { CheckIcon, PlaneIcon } from "@/components/Icons";
import { site, memberWins } from "@/lib/site";

export const metadata: Metadata = {
  title: `Sign up — ${site.name}`,
  description: `Pick a plan and create your free ${site.name} account to search award flights with your points.`,
};

const fmt = new Intl.NumberFormat("en-US");

const valuePoints = [
  "Get business class seats for close to economy prices",
  "See every program your points can transfer to in one search",
  "Know exactly how to book, step by step",
];

export default function SignupPage() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-sun-500 focus:text-ink-900 focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Slim header */}
      <header className="bg-ink-900 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2" aria-label={`${site.name} home`}>
            <span className="h-8 w-8 rounded-full bg-sun-500 flex items-center justify-center text-ink-900">
              <PlaneIcon className="w-4 h-4 -rotate-45" />
            </span>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight font-display text-white">{site.name}</span>
          </Link>
          <p className="text-sm text-white/70">
            <span className="hidden sm:inline">Already a member? </span>
            <Link href="/login" className="font-bold text-white hover:text-sun-400">Log in</Link>
          </p>
        </div>
      </header>

      <main id="main-content">
        {/* ============================================================ */}
        {/* HERO — value proposition                                     */}
        {/* ============================================================ */}
        <section className="hero-sky relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-50 450 C 300 330, 700 110, 1250 140" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" className="flight-path" />
          </svg>
          <div className="relative container mx-auto px-4 md:px-6 py-16 md:py-20 max-w-5xl grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
            <div className="animate-fade-up">
              <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white leading-[1.08] mb-6">
                Get <span className="text-sun-400">far more</span> out of every point you earn
              </h1>
              <ul className="space-y-3 mb-8">
                {valuePoints.map((v) => (
                  <li key={v} className="flex items-start gap-3 text-white/85 text-lg">
                    <span className="mt-1 h-5 w-5 shrink-0 rounded-full bg-sun-500 text-ink-900 flex items-center justify-center">
                      <CheckIcon className="w-3.5 h-3.5" />
                    </span>
                    {v}
                  </li>
                ))}
              </ul>
              <a href="#plans" className="inline-flex items-center rounded-full bg-sun-500 hover:bg-sun-600 px-7 py-3.5 font-bold text-ink-900 transition-colors">
                See plans
              </a>
            </div>

            {/* Sample member wins */}
            <div className="space-y-3 animate-fade-up" style={{ animationDelay: "120ms" }}>
              <p className="text-sm font-bold uppercase tracking-widest text-sun-400">What one trip can save</p>
              {memberWins.map((w) => {
                const saved = w.cash - w.taxes;
                return (
                  <div key={w.route} className="rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-white">{w.route}</p>
                      <p className="text-sm text-white/60">
                        {w.cabin} · {fmt.format(w.points)} pts + ${w.taxes}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/50 line-through">${fmt.format(w.cash)}</p>
                      <p className="font-extrabold text-sun-400">Save ${fmt.format(saved)}</p>
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-white/40">Sample fares for demonstration. Cash fare vs. taxes paid with points.</p>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PLANS + ACCOUNT CREATION                                     */}
        {/* ============================================================ */}
        <SignupFlow siteName={site.name} />
      </main>

      <footer className="bg-ink-950 text-white/40 text-xs">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl py-6 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} {site.name}. A student demo project.</span>
          <span>No payments are taken on this site.</span>
        </div>
      </footer>
    </>
  );
}
