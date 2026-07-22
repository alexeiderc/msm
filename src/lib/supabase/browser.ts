import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export function createClient() {
  const { url, key } = getSupabasePublicConfig();
  return createBrowserClient(url, key);
}
