import { createClient } from "@supabase/supabase-js";

// Server-only admin client. Uses the service role key, which BYPASSES
// RLS, so it must never be imported into client components.
// Used to create an auth login for a new employee.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
