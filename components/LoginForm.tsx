"use client";

import { useState } from "react";
import Link from "next/link";

// ============================================================
// LOGIN FORM — demo only.
// Nothing is sent anywhere: there is no account system yet.
// Hook these handlers up to a real auth provider later.
// ============================================================

type Step = "choose" | "password" | "email-code" | "enter-code" | "provider" | "done";

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

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 015.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 001 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0012 1 11 11 0 002.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.54 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.24 2.73 2.2 1.1-.04 1.51-.7 2.84-.7 1.32 0 1.7.7 2.86.68 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.41 1.2-2.47-.03-.01-2.3-.88-2.32-3.5zM14.2 6.13c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.31-.56.64-1.05 1.67-.92 2.66.97.08 1.96-.49 2.56-1.21z" />
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

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-base text-ink-900 placeholder:text-ink-400 focus:border-sun-500 focus:outline-none focus:ring-4 focus:ring-sun-300/40";
const labelClass = "block text-sm font-semibold text-ink-700 mb-1.5";
const primaryBtn =
  "w-full rounded-full bg-sun-500 hover:bg-sun-600 px-6 py-3.5 text-base font-bold text-ink-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export function LoginForm({ siteName }: { siteName: string }) {
  const [step, setStep] = useState<Step>("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [provider, setProvider] = useState<"Google" | "Apple">("Google");

  const reset = () => {
    setStep("choose");
    setPassword("");
    setCode("");
    setShowPassword(false);
  };

  const options = [
    {
      label: "Use a password",
      desc: "Log in with your email and password.",
      icon: <KeyIcon />,
      iconClass: "bg-ink-900 text-sun-400",
      onClick: () => setStep("password"),
    },
    {
      label: "Email me a code",
      desc: "We'll send a one-time code. No password needed.",
      icon: <MailIcon />,
      iconClass: "bg-sun-500 text-ink-900",
      onClick: () => setStep("email-code"),
    },
    {
      label: "Continue with Google",
      desc: "Use your Google account.",
      icon: <GoogleIcon />,
      iconClass: "bg-white ring-1 ring-ink-100",
      onClick: () => {
        setProvider("Google");
        setStep("provider");
      },
    },
    {
      label: "Continue with Apple",
      desc: "Use your Apple ID.",
      icon: <AppleIcon />,
      iconClass: "bg-ink-950 text-white",
      onClick: () => {
        setProvider("Apple");
        setStep("provider");
      },
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

        <ul className="space-y-3">
          {options.map((o) => (
            <li key={o.label}>
              <button
                type="button"
                onClick={o.onClick}
                className="group w-full flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-4 text-left hover:border-ink-200 hover:bg-ink-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sun-300/50 transition-colors"
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPassword("");
          setStep("done");
        }}
        aria-label="Log in with password"
      >
        <BackButton onClick={reset} />
        <h1 className="text-2xl font-extrabold font-display text-ink-900 mb-6">Log in with a password</h1>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" type="email" autoComplete="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-ink-700">Password</label>
              <button type="button" onClick={() => setStep("email-code")} className="text-sm font-semibold text-sun-600 hover:text-ink-900">
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

        <button type="submit" className={`${primaryBtn} mt-6`} disabled={!email || !password}>
          Log in
        </button>
      </form>
    );
  }

  // ---------- Step: request a one-time code ----------
  if (step === "email-code") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setStep("enter-code");
        }}
        aria-label="Email me a sign-in code"
      >
        <BackButton onClick={reset} />
        <h1 className="text-2xl font-extrabold font-display text-ink-900 mb-2">Email me a code</h1>
        <p className="text-ink-500 mb-6">Enter your email and we&apos;ll send a 6-digit code to sign in.</p>

        <label htmlFor="code-email" className={labelClass}>Email</label>
        <input id="code-email" type="email" autoComplete="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />

        <button type="submit" className={`${primaryBtn} mt-6`} disabled={!email}>
          Send code
        </button>
      </form>
    );
  }

  // ---------- Step: enter the one-time code ----------
  if (step === "enter-code") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setStep("done");
        }}
        aria-label="Enter sign-in code"
      >
        <BackButton onClick={reset} />
        <h1 className="text-2xl font-extrabold font-display text-ink-900 mb-2">Check your email</h1>
        <p className="text-ink-500 mb-6">
          We sent a code to <span className="font-semibold text-ink-900">{email}</span>.
        </p>

        <label htmlFor="otp" className={labelClass}>6-digit code</label>
        <input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="••••••"
          className={`${inputClass} text-center text-2xl font-bold tracking-[0.5em]`}
        />

        <button type="submit" className={`${primaryBtn} mt-6`} disabled={code.length !== 6}>
          Verify and log in
        </button>
        <button type="button" onClick={() => setCode("")} className="mt-4 w-full text-sm font-semibold text-ink-500 hover:text-ink-900">
          Didn&apos;t get it? Resend code
        </button>
      </form>
    );
  }

  // ---------- Step: social provider (placeholder) ----------
  if (step === "provider") {
    return (
      <div className="text-center">
        <BackButton onClick={reset} />
        <span className={`${iconBox} mx-auto mb-4 ${provider === "Google" ? "bg-white ring-1 ring-ink-100" : "bg-ink-950 text-white"}`}>
          {provider === "Google" ? <GoogleIcon /> : <AppleIcon />}
        </span>
        <h1 className="text-2xl font-extrabold font-display text-ink-900 mb-2">Continue with {provider}</h1>
        <p className="text-ink-500">
          {provider} sign-in isn&apos;t connected yet in this demo. Use a password or an email code for now.
        </p>
      </div>
    );
  }

  // ---------- Step: done (demo) ----------
  return (
    <div className="text-center" role="status">
      <span className={`${iconBox} mx-auto mb-4 bg-emerald-100 text-emerald-700`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <h1 className="text-2xl font-extrabold font-display text-ink-900 mb-2">You&apos;re in (demo)</h1>
      <p className="text-ink-500 mb-6">
        This is a front-end preview. No account was checked and nothing was sent.
      </p>
      <Link href="/" className={`${primaryBtn} inline-block`}>
        Back to search
      </Link>
    </div>
  );
}
