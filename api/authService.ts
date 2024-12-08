import type { AuthTokenResponsePassword } from "@supabase/auth-js/src/lib/types";
import useSupabase from "~/api/supabaseInit";

const login = (
  email: string,
  password: string,
): Promise<AuthTokenResponsePassword> => {
  return useSupabase().auth.signInWithPassword({
    email,
    password,
  });
};

export const authService = {
  login,
};
