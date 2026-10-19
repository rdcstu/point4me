import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/insider/ArticleCard";
import { CategoryTabs, InsiderCta, InsiderFooter, InsiderHeader } from "@/components/insider/InsiderChrome";
import { categories, articlesIn, sortedArticles } from "@/lib/articles";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Insider — award travel tips and guides | ${site.name}`,
  description: "Plain-language guides to earning and redeeming credit card points and airline miles.",
};

export default function InsiderHome() {
  const all = sortedArticles();
  const featured = all.find((a) => a.featured) ?? all[0];
  const latest = all.filter((a) => a !== featured).slice(0, 6);
  const trending = all.filter((a) => a.trending && a !== featured).slice(0, 4);

  return (
    <>
      <InsiderHeader />
      <CategoryTabs active="all" />
      <main id="main-content" className="bg-ink-50">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl py-10 md:py-14 space-y-14">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-sun-600 mb-2">Point4Me Insider</p>
            <h1 className="text-3xl md:text-5xl font-extrabold font-display text-ink-900 max-w-3xl">
              Smarter ways to earn points and book award flights
            </h1>
          </div>

          <ArticleCard article={featured} variant="hero" />

          <section aria-labelledby="latest-heading">
            <div className="flex items-end justify-between mb-6">
              <h2 id="latest-heading" className="text-2xl md:text-3xl font-bold font-display text-ink-900">The latest</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {latest.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>

          <section aria-labelledby="trending-heading" className="rounded-3xl bg-white ring-1 ring-ink-900/5 p-6 md:p-8">
            <h2 id="trending-heading" className="text-2xl font-bold font-display text-ink-900 mb-2">🔥 Trending insights</h2>
            <div className="grid md:grid-cols-2 gap-x-8 divide-y divide-ink-100 md:divide-y-0">
              {trending.map((a) => (
                <ArticleCard key={a.slug} article={a} variant="row" />
              ))}
            </div>
          </section>

          <section aria-labelledby="topics-heading">
            <h2 id="topics-heading" className="text-2xl md:text-3xl font-bold font-display text-ink-900 mb-6">Explore by topic</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((c) => {
                const items = articlesIn(c.id).slice(0, 3);
                return (
                  <div key={c.id} className="rounded-3xl bg-white ring-1 ring-ink-900/5 p-6 flex flex-col">
                    <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${c.gradient} mb-4`} aria-hidden="true" />
                    <h3 className="text-lg font-bold text-ink-900">{c.name}</h3>
                    <p className="text-sm text-ink-500 mb-4">{c.blurb}</p>
                    <ul className="space-y-2 flex-1">
                      {items.map((a) => (
                        <li key={a.slug}>
                          <Link href={`/insider/${a.category}/${a.slug}`} className="text-sm font-semibold text-ink-700 hover:text-sun-600">
                            {a.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href={`/insider/${c.id}`} className="mt-4 text-sm font-bold text-sun-600 hover:text-ink-900">
                      All {c.name.toLowerCase()} →
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>

          <InsiderCta />
        </div>
      </main>
      <InsiderFooter />
    </>
  );
}
