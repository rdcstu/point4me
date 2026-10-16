// Supabase client for the browser (client components).
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

// Social providers switched on in Supabase (Authentication → Sign In / Providers).
// List them in NEXT_PUBLIC_AUTH_PROVIDERS, e.g. "google,apple".
export function enabledProviders(): string[] {
  return (process.env.NEXT_PUBLIC_AUTH_PROVIDERS ?? "")
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
}
