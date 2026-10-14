"use client";

import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email) setDone(true);
      }}
      className="flex flex-col sm:flex-row gap-2"
      aria-label="Subscribe to weekly deals"
    >
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="flex-1 rounded-full bg-white/10 px-5 py-3 text-white placeholder:text-white/50 ring-1 ring-white/15 focus:outline-none focus:ring-sun-400"
      />
      <button
        type="submit"
        className="rounded-full bg-sun-500 hover:bg-sun-600 px-6 py-3 font-bold text-ink-900 transition-colors"
      >
        {done ? "You're in ✓" : "Get deals"}
      </button>
    </form>
  );
}
