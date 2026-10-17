// Supabase sends people here after Google/Apple sign-in, email confirmation
// and sign-in links. It swaps the one-time code for a session cookie.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(next: string | null) {
  // Only allow redirects within this site
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  const reason = searchParams.get("error_description") ?? "That sign-in link is invalid or has expired.";
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);
}
