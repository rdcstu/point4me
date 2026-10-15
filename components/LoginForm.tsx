"use client";

import { useState } from "react";
import Link from "next/link";
import { GoogleIcon, AppleIcon } from "./Icons";

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
