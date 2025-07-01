import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/api/types/db";

let supabaseInstance: SupabaseClient<Database> | undefined;

export default function useSupabase(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    const config = useRuntimeConfig();
    if (!config.public.supabaseUrl || !config.public.supabaseKey) {
      throw new Error("Supabase URL or Key is missing in runtime config.");
    }
    supabaseInstance = createClient<Database>(
      config.public.supabaseUrl,
      config.public.supabaseKey,
    );
  }
  return supabaseInstance;
}

if (import.meta.test) {
  exports.__resetSupabaseInstance = () => {
    supabaseInstance = undefined;
  };
}
