import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/insider/ArticleCard";
import { CategoryTabs, InsiderCta, InsiderFooter, InsiderHeader } from "@/components/insider/InsiderChrome";
import { categories, categoryOf, articlesIn } from "@/lib/articles";
import { site } from "@/lib/site";

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = categoryOf((await params).category);
  return cat ? { title: `${cat.name} — Insider | ${site.name}`, description: cat.blurb } : {};
}

export default async function CategoryPage({ params }: Props) {
  const cat = categoryOf((await params).category);
  if (!cat) notFound();
  const items = articlesIn(cat.id);

  return (
    <>
      <InsiderHeader />
      <CategoryTabs active={cat.id} />
      <main id="main-content" className="bg-ink-50">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl py-10 md:py-14 space-y-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-sun-600 mb-2">Insider</p>
            <h1 className="text-3xl md:text-5xl font-extrabold font-display text-ink-900">{cat.name}</h1>
            <p className="mt-2 text-lg text-ink-500">{cat.blurb}</p>
          </div>
          {items.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          ) : (
            <p className="text-ink-500">No articles here yet.</p>
          )}
          <InsiderCta />
        </div>
      </main>
      <InsiderFooter />
    </>
  );
}
