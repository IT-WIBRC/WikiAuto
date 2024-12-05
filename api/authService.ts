import useSupabase from  "~/api/supabaseInit";
import {AuthTokenResponsePassword} from "@supabase/auth-js/src/lib/types";

const login = (email: string, password: string): Promise<AuthTokenResponsePassword> => {
    return useSupabase().auth.signInWithPassword({ email, password });
}

export const authService = {
    login,
}