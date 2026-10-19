import Link from "next/link";
import { articleHref, categoryOf, formatDate, readMinutes, type Article } from "@/lib/articles";

// Article preview used on the home page and across /insider.
// variant: "card" (grid tile), "row" (compact list item), "hero" (large featured story)

function Cover({ article, className = "" }: { article: Article; className?: string }) {
  const cat = categoryOf(article.category)!;
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${cat.gradient} ${className}`} aria-hidden="true">
      <span className="absolute inset-0 flex items-center justify-center text-6xl drop-shadow-sm">{article.emoji}</span>
    </div>
  );
}

export function CategoryLabel({ article, light = false }: { article: Article; light?: boolean }) {
  const cat = categoryOf(article.category)!;
  return (
    <Link
      href={`/insider/${cat.id}`}
      className={`relative z-10 text-xs font-extrabold uppercase tracking-widest ${light ? "text-sun-300 hover:text-white" : "text-sun-600 hover:text-ink-900"}`}
    >
      {cat.name}
    </Link>
  );
}

function Meta({ article, light = false }: { article: Article; light?: boolean }) {
  return (
    <p className={`text-sm ${light ? "text-white/70" : "text-ink-500"}`}>
      {formatDate(article.date)} · {article.author} · {readMinutes(article)} min read
    </p>
  );
}

export function ArticleCard({ article, variant = "card" }: { article: Article; variant?: "card" | "row" | "hero" }) {
  const href = articleHref(article);

  if (variant === "hero") {
    return (
      <article className="relative grid md:grid-cols-2 overflow-hidden rounded-3xl bg-ink-900 text-white">
        <Cover article={article} className="h-56 md:h-auto md:min-h-80" />
        <div className="p-6 md:p-10 flex flex-col justify-center">
          <CategoryLabel article={article} light />
          <h2 className="mt-2 text-2xl md:text-4xl font-extrabold font-display leading-tight">
            <Link href={href} className="after:absolute after:inset-0 hover:text-sun-300 transition-colors">
              {article.title}
            </Link>
          </h2>
          <p className="mt-3 text-white/80 text-lg">{article.summary}</p>
          <div className="mt-4">
            <Meta article={article} light />
          </div>
        </div>
      </article>
    );
  }

  if (variant === "row") {
    return (
      <article className="relative flex gap-4 py-4">
        <Cover article={article} className="h-20 w-28 shrink-0 rounded-xl [&>span]:text-3xl" />
        <div className="min-w-0">
          <CategoryLabel article={article} />
          <h3 className="mt-0.5 font-bold text-ink-900 leading-snug">
            <Link href={href} className="after:absolute after:inset-0 hover:text-sun-600 transition-colors">
              {article.title}
            </Link>
          </h3>
          <p className="mt-1 text-xs text-ink-500">{formatDate(article.date)} · {readMinutes(article)} min read</p>
        </div>
      </article>
    );
  }

  return (
    <article className="relative flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-ink-900/5 shadow-sm hover:shadow-lg transition-shadow">
      <Cover article={article} className="h-40" />
      <div className="flex flex-1 flex-col p-5">
        <CategoryLabel article={article} />
        <h3 className="mt-1 text-lg font-bold text-ink-900 leading-snug">
          <Link href={href} className="after:absolute after:inset-0 hover:text-sun-600 transition-colors">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-ink-500 flex-1">{article.summary}</p>
        <p className="mt-4 text-xs text-ink-400">
          {formatDate(article.date)} · {readMinutes(article)} min read
        </p>
      </div>
    </article>
  );
}
