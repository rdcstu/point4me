import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard, CategoryLabel } from "@/components/insider/ArticleCard";
import { CategoryTabs, InsiderCta, InsiderFooter, InsiderHeader } from "@/components/insider/InsiderChrome";
import { articles, categoryOf, findArticle, formatDate, readMinutes, slugify, sortedArticles } from "@/lib/articles";
import { site } from "@/lib/site";

type Props = { params: Promise<{ category: string; slug: string }> };

export function generateStaticParams() {
  return articles.map((a) => ({ category: a.category, slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const a = findArticle(category, slug);
  return a ? { title: `${a.title} | ${site.name} Insider`, description: a.summary } : {};
}

export default async function ArticlePage({ params }: Props) {
  const { category, slug } = await params;
  const article = findArticle(category, slug);
  if (!article) notFound();
  const cat = categoryOf(article.category)!;

  const headings = article.body.flatMap((b) => ("h" in b ? [b.h] : []));
  const related = [
    ...sortedArticles().filter((a) => a.category === article.category && a !== article),
    ...sortedArticles().filter((a) => a.category !== article.category),
  ].slice(0, 3);

  return (
    <>
      <InsiderHeader />
      <CategoryTabs active={cat.id} />
      <main id="main-content" className="bg-white">
        <article className="container mx-auto px-4 md:px-6 max-w-6xl py-10 md:py-14">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="text-sm text-ink-500 mb-6">
            <Link href="/insider" className="hover:text-ink-900">Insider</Link>
            <span aria-hidden="true"> / </span>
            <Link href={`/insider/${cat.id}`} className="hover:text-ink-900">{cat.name}</Link>
          </nav>

          <header className="max-w-3xl">
            <CategoryLabel article={article} />
            <h1 className="mt-2 text-3xl md:text-5xl font-extrabold font-display text-ink-900 leading-tight">{article.title}</h1>
            <p className="mt-4 text-xl text-ink-500">{article.summary}</p>
            <p className="mt-4 text-sm text-ink-500">
              By <span className="font-semibold text-ink-900">{article.author}</span> · {formatDate(article.date)} · {readMinutes(article)} min read
            </p>
          </header>

          <div className={`mt-8 h-48 md:h-72 rounded-3xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-7xl`} aria-hidden="true">
            {article.emoji}
          </div>

          <div className="mt-10 grid lg:grid-cols-[1fr_260px] gap-12">
            {/* Body */}
            <div className="max-w-2xl text-lg leading-relaxed text-ink-700 space-y-5">
              {article.body.map((b, i) => {
                if ("h" in b)
                  return (
                    <h2 key={i} id={slugify(b.h)} className="pt-4 text-2xl font-bold font-display text-ink-900 scroll-mt-20">
                      {b.h}
                    </h2>
                  );
                if ("list" in b)
                  return (
                    <ul key={i} className="list-disc pl-6 space-y-2">
                      {b.list.map((li) => (
                        <li key={li}>{li}</li>
                      ))}
                    </ul>
                  );
                if ("tip" in b)
                  return (
                    <aside key={i} className="rounded-2xl bg-sun-300/25 border-l-4 border-sun-500 px-5 py-4 text-ink-800">
                      <span className="font-bold">Tip: </span>
                      {b.tip}
                    </aside>
                  );
                return <p key={i}>{b.p}</p>;
              })}

              {/* Author box */}
              <div className="mt-10 flex items-center gap-4 rounded-2xl bg-ink-50 p-5">
                <span className="h-12 w-12 shrink-0 rounded-full bg-ink-900 text-sun-400 flex items-center justify-center font-extrabold" aria-hidden="true">
                  {article.author.charAt(0)}
                </span>
                <div>
                  <p className="font-bold text-ink-900 text-base">{article.author}</p>
                  <p className="text-sm text-ink-500">Writes about points, miles and award travel for {site.name} Insider.</p>
                </div>
              </div>
            </div>

            {/* Table of contents */}
            {headings.length > 0 && (
              <aside className="hidden lg:block">
                <nav aria-label="On this page" className="sticky top-20 rounded-2xl bg-ink-50 p-5">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500 mb-3">On this page</p>
                  <ul className="space-y-2 text-sm">
                    {headings.map((h) => (
                      <li key={h}>
                        <a href={`#${slugify(h)}`} className="font-semibold text-ink-700 hover:text-sun-600">{h}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}
          </div>
        </article>

        <div className="bg-ink-50">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl py-12 space-y-12">
            <section aria-labelledby="related-heading">
              <h2 id="related-heading" className="text-2xl font-bold font-display text-ink-900 mb-6">Keep reading</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            </section>
            <InsiderCta />
          </div>
        </div>
      </main>
      <InsiderFooter />
    </>
  );
}
