
import { createClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL;
const publishableKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  url && publishableKey
);

export const supabase = isSupabaseConfigured
  ? createClient(url, publishableKey, {
      auth: {
        // Keep the customer signed in across page refreshes.
        persistSession: true,

        // Refresh the session token automatically when possible.
        autoRefreshToken: true,

        // Support authentication redirects such as Google login.
        detectSessionInUrl: true,

        // Use the secure OAuth authorization-code flow.
        flowType: "pkce",
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file."
    );
  }

  return supabase;
}
