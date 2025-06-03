import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/api/wikiAutoType";

let supabaseInstance: ReturnType<createClient>;
export default function (): SupabaseClient<Database> {
  if (!supabaseInstance) {
    const config = useRuntimeConfig();
    supabaseInstance = createClient<Database>(
      config.public.supabaseUrl,
      config.public.supabaseKey,
    );
  }
  return supabaseInstance;
}
