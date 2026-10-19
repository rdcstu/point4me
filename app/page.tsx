// ============================================================
// POINTS-TRAVEL LANDING PAGE
// Brand name, copy and sample data live in lib/site.ts
// Colors live in app/globals.css (@theme ink / sun tokens)
// ============================================================

import { MobileNav } from "@/components/MobileNav";
import { AuthButtons } from "@/components/AuthButtons";
import { LiveDataButton } from "@/components/LiveDataButton";
import { SearchBox } from "@/components/SearchBox";
import { DealCarousel } from "@/components/DealCarousel";
import { Newsletter } from "@/components/Newsletter";
import { CheckIcon, ArrowRightIcon, PlaneIcon, SparklesIcon, BoltIcon, TrendingUpIcon, BookOpenIcon } from "@/components/Icons";
import { site, features, steps, examples, faqs, conciergeFromPrice } from "@/lib/site";
import { PricingSection } from "@/components/PricingSection";
import { ArticleCard } from "@/components/insider/ArticleCard";
import { sortedArticles } from "@/lib/articles";
import Link from "next/link";

const fmt = new Intl.NumberFormat("en-US");
const featureIcons = [PlaneIcon, SparklesIcon, BookOpenIcon, TrendingUpIcon];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="#top" className="flex items-center gap-2" aria-label={`${site.name} home`}>
      <span className="h-8 w-8 rounded-full bg-sun-500 flex items-center justify-center text-ink-900">
        <PlaneIcon className="w-4 h-4 -rotate-45" />
      </span>
      <span className={`text-base sm:text-xl font-extrabold tracking-tight font-display whitespace-nowrap ${light ? "text-white" : "text-ink-900"}`}>
        {site.name}
      </span>
    </a>
  );
}

export default function Home() {
  const maxCash = Math.max(...examples.map((e) => e.cash));

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-sun-500 focus:text-ink-900 focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* ============================================================ */}
      {/* ANNOUNCEMENT BAR                                             */}
      {/* ============================================================ */}
      <div id="top" className="bg-sun-500 text-ink-900 text-sm font-semibold">
        <div className="container mx-auto px-4 py-2 text-center">
          {site.announcement} <a href="#pricing" className="underline underline-offset-2 ml-1">Learn more</a>
        </div>
      </div>

      {/* ============================================================ */}
      {/* NAVIGATION                                                   */}
      {/* ============================================================ */}
      <nav aria-label="Main navigation" className="sticky top-0 z-50 bg-ink-900/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-16">
          <Logo light />
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <a href="#deals" className="whitespace-nowrap text-sm font-semibold text-white/80 hover:text-white transition-colors">Deals</a>
            <a href="#how" className="whitespace-nowrap text-sm font-semibold text-white/80 hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="whitespace-nowrap text-sm font-semibold text-white/80 hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="whitespace-nowrap text-sm font-semibold text-white/80 hover:text-white transition-colors">FAQ</a>
            <Link href="/insider" className="whitespace-nowrap text-sm font-semibold text-white/80 hover:text-white transition-colors">Insider</Link>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <LiveDataButton />
            <AuthButtons />
          </div>
          <div className="flex lg:hidden items-center gap-2">
            <LiveDataButton compact />
            <MobileNav />
          </div>
        </div>
      </nav>

      <main id="main-content">
        {/* ============================================================ */}
        {/* HERO + SEARCH                                                */}
        {/* ============================================================ */}
        <section className="hero-sky relative overflow-hidden">
          {/* Decorative flight path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-50 520 C 300 380, 700 120, 1250 160" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" className="flight-path" />
          </svg>

          <div className="relative container mx-auto px-4 md:px-6 pt-16 pb-24 md:pt-24 md:pb-32">
            <div className="max-w-3xl mx-auto text-center mb-10 animate-fade-up">
              <h1 className="text-4xl md:text-6xl font-extrabold font-display tracking-tight text-white leading-[1.05] mb-5">
                Your points can fly you <span className="text-sun-400">further</span> than you think
              </h1>
              <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto">
                {site.description}
              </p>
            </div>

            <div className="max-w-5xl mx-auto animate-fade-up" style={{ animationDelay: "120ms" }}>
              <SearchBox />
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-white/70">
              <span className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-sun-400" /> Free to explore</span>
              <span className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-sun-400" /> No card required</span>
              <span className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-sun-400" /> Booking steps included</span>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* DEAL CAROUSEL                                                */}
        {/* ============================================================ */}
        <section id="deals" className="py-20 bg-white scroll-mt-16">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <DealCarousel />
            <div className="mt-6">
              <a href="#top" className="inline-flex items-center gap-2 font-bold text-ink-900 hover:text-sun-600 transition-colors">
                Search more deals <ArrowRightIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* INSIDER ARTICLES — content lives in lib/articles.ts          */}
        {/* ============================================================ */}
        <section id="insider" className="pb-20 bg-white scroll-mt-16" aria-labelledby="insider-heading">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-sun-600 mb-2">Point4Me Insider</p>
                <h2 id="insider-heading" className="text-3xl md:text-4xl font-bold font-display text-ink-900">Read the latest Insider articles</h2>
              </div>
              <Link href="/insider" className="inline-flex items-center gap-2 font-bold text-ink-900 hover:text-sun-600 transition-colors">
                Read all <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedArticles()
                .slice(0, 3)
                .map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* FEATURES                                                     */}
        {/* ============================================================ */}
        <section className="py-20 bg-ink-50">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="max-w-2xl mb-12">
              <p className="text-sm font-bold uppercase tracking-widest text-sun-600 mb-2">Why travelers switch</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-ink-900">
                Stop guessing what your points are worth
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((f, i) => {
                const Icon = featureIcons[i % featureIcons.length];
                return (
                  <div key={f.title} className="rounded-3xl bg-white p-6 ring-1 ring-ink-900/5">
                    <div className="h-12 w-12 rounded-2xl bg-ink-900 text-sun-400 flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-ink-900 mb-2">{f.title}</h3>
                    <p className="text-ink-500 leading-relaxed">{f.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* HOW IT WORKS                                                 */}
        {/* ============================================================ */}
        <section id="how" className="py-20 bg-white scroll-mt-16">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-sm font-bold uppercase tracking-widest text-sun-600 mb-2">How it works</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-ink-900">From points to boarding pass in three steps</h2>
            </div>
            <ol className="grid md:grid-cols-3 gap-8">
              {steps.map((s, i) => (
                <li key={s.title} className="relative text-center md:text-left">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sun-500 text-2xl font-extrabold font-display text-ink-900 mb-5">
                    {i + 1}
                  </span>
                  <h3 className="text-xl font-bold text-ink-900 mb-2">{s.title}</h3>
                  <p className="text-ink-500 leading-relaxed">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============================================================ */}
        {/* POINTS VS CASH EXAMPLES                                      */}
        {/* ============================================================ */}
        <section className="py-20 bg-ink-900 text-white">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-sun-400 mb-2">Real value, side by side</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-5">See what you&apos;d pay out of pocket</h2>
              <p className="text-white/70 text-lg leading-relaxed mb-8">
                Premium cabins are where points shine. Compare the cash fare with what you&apos;d actually spend: points plus a small amount of taxes and fees.
              </p>
              <a href="#pricing" className="inline-flex items-center gap-2 rounded-full bg-sun-500 hover:bg-sun-600 px-6 py-3 font-bold text-ink-900 transition-colors">
                Find my trip <ArrowRightIcon className="w-4 h-4" />
              </a>
            </div>
            <div className="space-y-6">
              {examples.map((e) => (
                <div key={e.route} className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-6">
                  <p className="font-bold mb-4">{e.route}</p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm text-white/60 mb-1">
                        <span>Cash fare</span><span>${fmt.format(e.cash)}</span>
                      </div>
                      <div className="h-3 rounded-full bg-white/10">
                        <div className="h-3 rounded-full bg-white/40" style={{ width: `${(e.cash / maxCash) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-sun-400 font-semibold">With points</span>
                        <span className="font-semibold">{fmt.format(e.points)} pts + ${e.taxes}</span>
                      </div>
                      <div className="h-3 rounded-full bg-white/10">
                        <div className="h-3 rounded-full bg-sun-400" style={{ width: `${Math.max((e.taxes / maxCash) * 100, 2)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-white/40">Sample fares for demonstration.</p>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PRICING                                                      */}
        {/* ============================================================ */}
        <section id="pricing" className="py-20 bg-white scroll-mt-16">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-sm font-bold uppercase tracking-widest text-sun-600 mb-2">Membership</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-ink-900">Pick how much help you want</h2>
            </div>
            <PricingSection />
          </div>
        </section>

        {/* ============================================================ */}
        {/* CONCIERGE PROMO                                              */}
        {/* ============================================================ */}
        <section id="concierge" className="pb-20 bg-white scroll-mt-20">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="rounded-[2rem] bg-gradient-to-br from-sun-400 to-sun-500 p-8 md:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-display text-ink-900 mb-3">
                  No time to research transfers?
                </h2>
                <p className="text-ink-800 text-lg max-w-xl">
                  Tell us where you want to go. A points expert plans the routing, the transfers and the booking with you. From ${conciergeFromPrice} per trip.
                </p>
              </div>
              <a href="#pricing" className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 hover:bg-ink-800 px-7 py-4 font-bold text-white transition-colors">
                <BoltIcon className="w-5 h-5 text-sun-400" /> Get expert help
              </a>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* FAQ                                                          */}
        {/* ============================================================ */}
        <section id="faq" className="py-20 bg-ink-50 scroll-mt-16">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-ink-900 text-center mb-12">Frequently asked questions</h2>
            <div className="space-y-3">
              {faqs.map((f) => (
                <details key={f.q} className="group rounded-2xl bg-white ring-1 ring-ink-900/5 open:shadow-md">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 font-bold text-ink-900 [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="h-8 w-8 shrink-0 rounded-full bg-ink-50 flex items-center justify-center text-xl leading-none text-ink-700 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="px-6 pb-6 -mt-2 text-ink-500 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/* FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="bg-ink-950 text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl py-16 grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo light />
            <p className="text-white/60 mt-4 mb-6 max-w-sm">Weekly award deals, straight to your inbox.</p>
            <Newsletter />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-white/60">
                <li><a href="#top" className="hover:text-white">Award search</a></li>
                <li><a href="#deals" className="hover:text-white">Deals</a></li>
                <li><a href="#pricing" className="hover:text-white">Concierge</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-white/60">
                <li><a href="#how" className="hover:text-white">How it works</a></li>
                <li><Link href="/insider" className="hover:text-white">Insider articles</Link></li>
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-white/60">
                <li><a href="#top" className="hover:text-white">About</a></li>
                <li><a href="#top" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl py-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-white/40">
            <span>© {new Date().getFullYear()} {site.name}. A student demo project.</span>
            <span>Fares shown are sample data.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
