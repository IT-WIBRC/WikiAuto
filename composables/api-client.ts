import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/shared/types/database.types";

let apiClientInstance: SupabaseClient<Database> | null = null;
export const useApiClient = (): SupabaseClient<Database> => {
  if (apiClientInstance) {
    return apiClientInstance;
  }

  const config = useRuntimeConfig();
  const apiEndpointUrl = config.public.databaseUrl as string;
  const publicApiKey = config.public.databaseClientKey as string;

  if (!apiEndpointUrl) {
    throw new Error(
      "API Endpoint URL is missing in runtime config. Please check your .env file.",
    );
  }

  if (!publicApiKey) {
    throw new Error(
      "API Public API Key is missing in runtime config. Please check your  env file.",
    );
  }

  apiClientInstance = createClient<Database>(apiEndpointUrl, publicApiKey);
  return apiClientInstance;
};

export const _clearApiClientInstanceForTesting = (): void => {
  apiClientInstance = null;
};
