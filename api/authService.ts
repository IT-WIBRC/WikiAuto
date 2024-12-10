import type { AuthTokenResponsePassword } from "@supabase/auth-js/src/lib/types";
import useSupabase from "~/api/supabaseInit";
import type { AuthError } from "@supabase/auth-js";

const login = (
  email: string,
  password: string,
): Promise<AuthTokenResponsePassword> => {
  return useSupabase().auth.signInWithPassword({
    email,
    password,
  });
};

const logout = (): Promise<{ error: AuthError | null }> => {
  return useSupabase().auth.signOut({ scope: "global" });
};

export const authService = {
  login,
  logout,
};
