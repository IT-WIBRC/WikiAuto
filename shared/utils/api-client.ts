import type { H3Event } from "h3";
import type { Database } from "~/shared/types/database.types";
import type {
  DatabaseClientInterface,
  DBUser,
} from "~/shared/types/data-access";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export async function useServerClient(
  event: H3Event,
): Promise<DatabaseClientInterface<Database>> {
  return await serverSupabaseClient(event);
}

let apiClientInstance: DatabaseClientInterface<Database> | null = null;
export const useApiClient = (): DatabaseClientInterface<Database> => {
  if (apiClientInstance) {
    return apiClientInstance;
  }

  apiClientInstance = useSupabaseClient();
  return apiClientInstance;
};

export function useClientUser(): Ref<DBUser | null> {
  return useSupabaseUser();
}

export async function useServerUser(event: H3Event): Promise<DBUser | null> {
  return await serverSupabaseUser(event);
}
