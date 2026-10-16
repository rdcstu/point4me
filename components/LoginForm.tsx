"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleIcon, AppleIcon } from "./Icons";
import { createClient, enabledProviders } from "@/lib/supabase/client";

// ============================================================
// LOGIN FORM — signs people in with Supabase Auth.
// Methods: email + password, emailed one-time sign-in link, Google, Apple.
// Google/Apple only go live once listed in NEXT_PUBLIC_AUTH_PROVIDERS.
// ============================================================

type Step = "choose" | "password" | "email-link" | "link-sent" | "provider";
type Provider = "google" | "apple";

const iconBox = "h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center";

function KeyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="w-5 h-5 text-ink-400 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      All sign-in options
    </button>
  );
}

function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
      {message}
    </p>
  );
}

// Turn Supabase error messages into friendlier copy
function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match. Try again or use an email link.";
  if (m.includes("email not confirmed")) return "Please confirm your email first. Check your inbox for the confirmation link.";
  if (m.includes("signups not allowed") || m.includes("user not found")) return "We couldn't find an account with that email. Sign up first?";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Please wait a few minutes and try again.";
  return message;
}

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-base text-ink-900 placeholder:text-ink-400 focus:border-sun-500 focus:outline-none focus:ring-4 focus:ring-sun-300/40";
const labelClass = "block text-sm font-semibold text-ink-700 mb-1.5";
const primaryBtn =
  "w-full rounded-full bg-sun-500 hover:bg-sun-600 px-6 py-3.5 text-base font-bold text-ink-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export function LoginForm({
  siteName,
  next = "/account",
  initialError = null,
}: {
  siteName: string;
  next?: string;
  initialError?: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [provider, setProvider] = useState<Provider>("google");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [notice, setNotice] = useState<string | null>(null);

  const go = (s: Step) => {
    setError(null);
    setNotice(null);
    setStep(s);
  };

  const reset = () => {
    setPassword("");
    setShowPassword(false);
    go("choose");
  };

  const signedIn = () => {
    router.replace(next);
    router.refresh();
  };

  const callbackUrl = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function loginWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(friendly(error.message));
    setPassword("");
    signedIn();
  }

  async function sendLink(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: callbackUrl() },
    });
    setBusy(false);
    if (error) return setError(friendly(error.message));
    setNotice(null);
    setStep("link-sent");
  }

  async function startOAuth(p: Provider) {
    setProvider(p);
    if (!enabledProviders().includes(p)) return go("provider");
    setBusy(true);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: p,
      options: { redirectTo: callbackUrl() },
    });
    if (error) {
      setBusy(false);
      setError(friendly(error.message));
    }
    // On success the browser is sent to Google/Apple, then back to /auth/callback
  }

  const options = [
    {
      label: "Use a password",
      desc: "Log in with your email and password.",
      icon: <KeyIcon />,
      iconClass: "bg-ink-900 text-sun-400",
      onClick: () => go("password"),
    },
    {
      label: "Email me a link",
      desc: "We'll email a one-time sign-in link. No password needed.",
      icon: <MailIcon />,
      iconClass: "bg-sun-500 text-ink-900",
      onClick: () => go("email-link"),
    },
    {
      label: "Continue with Google",
      desc: "Use your Google account.",
      icon: <GoogleIcon />,
      iconClass: "bg-white ring-1 ring-ink-100",
      onClick: () => startOAuth("google"),
    },
    {
      label: "Continue with Apple",
      desc: "Use your Apple ID.",
      icon: <AppleIcon />,
      iconClass: "bg-ink-950 text-white",
      onClick: () => startOAuth("apple"),
    },
  ];

  // ---------- Step: choose a method ----------
  if (step === "choose") {
    return (
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-ink-900 text-center mb-2">
          Log in to {siteName}
        </h1>
        <p className="text-center text-ink-500 mb-7">Choose how you&apos;d like to sign in.</p>

        <ErrorNote message={error} />

        <ul className="space-y-3">
          {options.map((o) => (
            <li key={o.label}>
              <button
                type="button"
                onClick={o.onClick}
                disabled={busy}
                className="group w-full flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-4 text-left hover:border-ink-200 hover:bg-ink-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sun-300/50 transition-colors disabled:opacity-60"
              >
                <span className={`${iconBox} ${o.iconClass}`}>{o.icon}</span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-ink-900">{o.label}</span>
                  <span className="block text-sm text-ink-500">{o.desc}</span>
                </span>
                <ChevronRight />
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-7 text-center text-xs text-ink-400">
          By continuing you agree to the Terms of Service and Privacy Policy.
        </p>
      </div>
    );
  }

  // ---------- Step: email + password ----------
  if (step === "password") {
    return (
      <form onSubmit={loginWithPassword} aria-label="Log in with password">
        <BackButton onClick={reset} />
        <h1 className="text-2xl font-extrabold font-display text-ink-900 mb-6">Log in with a password</h1>

        <ErrorNote message={error} />

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" type="email" autoComplete="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-ink-700">Password</label>
              <button
                type="button"
                onClick={() => {
                  go("email-link");
                  setNotice("We'll email you a sign-in link. Once you're in, set a new password from your account page.");
                }}
                className="text-sm font-semibold text-sun-600 hover:text-ink-900"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-16`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-sm font-semibold text-ink-500 hover:bg-ink-50 hover:text-ink-900"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>

        <button type="submit" className={`${primaryBtn} mt-6`} disabled={!email || !password || busy}>
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
    );
  }

  // ---------- Step: request a sign-in link ----------
  if (step === "email-link") {
    return (
      <form onSubmit={sendLink} aria-label="Email me a sign-in link">
        <BackButton onClick={reset} />
        <h1 className="text-2xl font-extrabold font-display text-ink-900 mb-2">Email me a sign-in link</h1>
        <p className="text-ink-500 mb-6">{notice ?? "Enter your email and we'll send a one-time link that logs you in."}</p>

        <ErrorNote message={error} />

        <label htmlFor="link-email" className={labelClass}>Email</label>
        <input id="link-email" type="email" autoComplete="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />

        <button type="submit" className={`${primaryBtn} mt-6`} disabled={!email || busy}>
          {busy ? "Sending…" : "Send link"}
        </button>
      </form>
    );
  }

  // ---------- Step: link sent ----------
  if (step === "link-sent") {
    return (
      <div className="text-center" role="status">
        <BackButton onClick={reset} />
        <span className={`${iconBox} mx-auto mb-4 bg-sun-500 text-ink-900`}>
          <MailIcon />
        </span>
        <h1 className="text-2xl font-extrabold font-display text-ink-900 mb-2">Check your email</h1>
        <p className="text-ink-500 mb-2">
          We sent a sign-in link to <span className="font-semibold text-ink-900">{email}</span>.
        </p>
        <p className="text-sm text-ink-400 mb-6">Open it in this same browser. It may take a minute to arrive, so check spam too.</p>

        <ErrorNote message={error} />

        <button type="button" onClick={() => sendLink()} disabled={busy} className="text-sm font-semibold text-ink-500 hover:text-ink-900 disabled:opacity-50">
          {busy ? "Sending…" : "Didn't get it? Send another link"}
        </button>
      </div>
    );
  }

  // ---------- Step: social provider not switched on yet ----------
  const label = provider === "google" ? "Google" : "Apple";
  return (
    <div className="text-center">
      <BackButton onClick={reset} />
      <span className={`${iconBox} mx-auto mb-4 ${provider === "google" ? "bg-white ring-1 ring-ink-100" : "bg-ink-950 text-white"}`}>
        {provider === "google" ? <GoogleIcon /> : <AppleIcon />}
      </span>
      <h1 className="text-2xl font-extrabold font-display text-ink-900 mb-2">Continue with {label}</h1>
      <p className="text-ink-500">
        {label} sign-in isn&apos;t switched on yet. Use a password or an email link for now.
      </p>
    </div>
  );
}
