import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/LoginForm";
import { PlaneIcon } from "@/components/Icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Log in — ${site.name}`,
  description: `Log in to ${site.name} to search award flights with your points.`,
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next: rawNext, error } = await searchParams;
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/account";

  // Already signed in? Skip the form.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(next);

  return (
    <main className="hero-sky relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Decorative flight path, same as the home page hero */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-50 700 C 300 520, 700 180, 1250 220" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" className="flight-path" />
      </svg>

      <div className="relative w-full max-w-md animate-fade-up">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8" aria-label={`${site.name} home`}>
          <span className="h-10 w-10 rounded-full bg-sun-500 flex items-center justify-center text-ink-900">
            <PlaneIcon className="w-5 h-5 -rotate-45" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight font-display text-white">{site.name}</span>
        </Link>

        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-2xl shadow-ink-950/40">
          <LoginForm siteName={site.name} next={next} initialError={error ?? null} />
        </div>

        <p className="mt-6 text-center text-sm text-white/70">
          New here?{" "}
          <Link href="/signup" className="font-bold text-sun-400 hover:text-sun-300 underline-offset-2 hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </main>
  );
}
