"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ChangePassword() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage(null);
        const { error } = await createClient().auth.updateUser({ password });
        setBusy(false);
        setPassword("");
        setMessage(error ? { ok: false, text: error.message } : { ok: true, text: "Password updated." });
      }}
      className="flex flex-col sm:flex-row gap-3"
      aria-label="Set a new password"
    >
      <label htmlFor="new-password" className="sr-only">New password</label>
      <input
        id="new-password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password (8+ characters)"
        className="flex-1 rounded-xl border border-ink-200 bg-white px-4 py-3 text-base text-ink-900 placeholder:text-ink-400 focus:border-sun-500 focus:outline-none focus:ring-4 focus:ring-sun-300/40"
      />
      <button
        type="submit"
        disabled={password.length < 8 || busy}
        className="rounded-full bg-ink-900 hover:bg-ink-800 px-6 py-3 font-bold text-white transition-colors disabled:opacity-50"
      >
        {busy ? "Saving…" : "Update password"}
      </button>
      {message && (
        <p role="status" className={`sm:basis-full text-sm font-medium ${message.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
