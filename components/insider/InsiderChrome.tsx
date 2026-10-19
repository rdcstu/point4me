import Link from "next/link";
import { PlaneIcon } from "@/components/Icons";
import { site } from "@/lib/site";
import { categories, type CategoryId } from "@/lib/articles";

// Header, category tabs and footer shared by all /insider pages.

export function InsiderHeader() {
  return (
    <header className="bg-ink-900 border-b border-white/10">
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-16 gap-4">
        <Link href="/" className="flex items-center gap-2 min-w-0" aria-label={`${site.name} home`}>
          <span className="h-8 w-8 shrink-0 rounded-full bg-sun-500 flex items-center justify-center text-ink-900">
            <PlaneIcon className="w-4 h-4 -rotate-45" />
          </span>
          <span className="truncate text-base sm:text-xl font-extrabold tracking-tight font-display text-white whitespace-nowrap">{site.name}</span>
        </Link>
        <nav aria-label="Insider" className="flex shrink-0 items-center gap-4 text-sm font-bold">
          <Link href="/insider" className="hidden sm:inline text-sun-400 hover:text-sun-300 whitespace-nowrap">Insider</Link>
          <Link href="/" className="hidden sm:inline text-white/80 hover:text-white whitespace-nowrap">Home</Link>
          <Link href="/signup" className="rounded-full bg-sun-500 hover:bg-sun-600 px-4 py-2 text-ink-900 whitespace-nowrap">Sign up free</Link>
        </nav>
      </div>
    </header>
  );
}

export function CategoryTabs({ active }: { active?: CategoryId | "all" }) {
  const tabs = [{ id: "all" as const, name: "All", href: "/insider" }, ...categories.map((c) => ({ id: c.id, name: c.name, href: `/insider/${c.id}` }))];
  return (
    <nav aria-label="Article categories" className="border-b border-ink-100 bg-white sticky top-0 z-30">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => {
            const on = (active ?? "all") === t.id;
            return (
              <li key={t.id}>
                <Link
                  href={t.href}
                  aria-current={on ? "page" : undefined}
                  className={`block whitespace-nowrap px-4 py-3.5 text-sm font-bold border-b-2 transition-colors ${
                    on ? "border-sun-500 text-ink-900" : "border-transparent text-ink-500 hover:text-ink-900"
                  }`}
                >
                  {t.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export function InsiderCta() {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-sun-400 to-sun-500 p-8 md:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold font-display text-ink-900 mb-2">Put these tips to work</h2>
        <p className="text-ink-800">Search award seats across programs and see exactly how to book with the points you have.</p>
      </div>
      <Link href="/signup" className="inline-flex justify-center rounded-full bg-ink-900 hover:bg-ink-800 px-7 py-3.5 font-bold text-white whitespace-nowrap">
        Start for free
      </Link>
    </section>
  );
}

export function InsiderFooter() {
  return (
    <footer className="bg-ink-950 text-white/50 text-xs">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl py-6 flex flex-col sm:flex-row justify-between gap-2">
        <span>© {new Date().getFullYear()} {site.name}. Insider articles are general information, not financial advice.</span>
        <span className="flex gap-4">
          <Link href="/insider" className="hover:text-white">Insider</Link>
          <Link href="/#pricing" className="hover:text-white">Pricing</Link>
          <Link href="/" className="hover:text-white">Home</Link>
        </span>
      </div>
    </footer>
  );
}
