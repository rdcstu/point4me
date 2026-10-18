// Shared check for the private /live API routes: signed in AND listed in OWNER_EMAILS.
import { createClient } from "@/lib/supabase/server";
import { isOwner } from "@/lib/owner";

export async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isOwner(user) ? user : null;
}
