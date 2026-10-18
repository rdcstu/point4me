// Who counts as the site owner (for private, personal-use pages like /live).
// Set OWNER_EMAILS in .env.local to a comma-separated list of login emails.
import type { User } from "@supabase/supabase-js";

export function isOwner(user: User | null) {
  if (!user?.email) return false;
  const owners = (process.env.OWNER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return owners.includes(user.email.toLowerCase());
}
