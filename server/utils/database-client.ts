import type { DatabaseClientInterface } from "~/shared/types/data-access";
import { createClient } from "@supabase/supabase-js";

let databaseClientInstance: null | DatabaseClientInterface;
export const useDatabaseClient = (): DatabaseClientInterface => {
  if (databaseClientInstance) {
    return databaseClientInstance;
  }

  const config = useRuntimeConfig();
  const clientKey: string = config.public.databaseClientKey as string;
  const databaseUrl: string = config.public.databaseUrl as string;

  if (!databaseUrl) {
    throw new Error(
      "Database URL (NUXT_PUBLIC_DATABASE_URL) is not configured in runtimeConfig.",
    );
  }
  if (!clientKey) {
    throw new Error(
      "Database Client Key (NUXT_PUBLIC_DATABASE_CLIENT_KEY) is not configured in runtimeConfig.",
    );
  }

  databaseClientInstance = createClient(databaseUrl, clientKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
  return databaseClientInstance;
};

export const _clearDatabaseClientInstanceForTesting = (): void => {
  databaseClientInstance = null;
};
