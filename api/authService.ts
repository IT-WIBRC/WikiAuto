import useSupabase from "~/api/supabaseInit";
import type {
  AuthError,
  AuthTokenResponsePassword,
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import type { EditUserInfoPayload, GetProfile } from "./types";

const login = async (
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

const getUserProfile = async (
  userId: string,
): Promise<PostgrestSingleResponse<GetProfile>> => {
  return useSupabase()
    .from("profile")
    .select("email, username, lastname, firstname, created_at")
    .eq("user_id", userId)
    .single();
};

const editUserInfo = async (
  userData: EditUserInfoPayload,
): Promise<PostgrestResponse<GetProfile>> => {
  return useSupabase()
    .from("profile")
    .update({
      username: userData.username,
      lastname: userData.lastname,
      firstname: userData.firstname,
    })
    .eq("user_id", userData.user_id)
    .select()
    .single();
};

export const authService = {
  login,
  logout,
  getUserProfile,
  editUserInfo,
};
