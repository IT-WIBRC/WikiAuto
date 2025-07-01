import useSupabase from "~/api/utils/supabaseInit";
import type {
  AuthResponse,
  AuthTokenResponsePassword,
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import type { EditProfileInfoPayload, GetProfile } from "./";

const login = async (
  email: string,
  password: string,
): Promise<AuthTokenResponsePassword> => {
  return await useSupabase().auth.signInWithPassword({
    email,
    password,
  });
};

const logout = async () => {
  return (await useSupabase().auth.signOut({
    scope: "global",
  })) as unknown as Promise<AuthResponse>;
};

const getUserProfile = async (
  userId: string,
): Promise<PostgrestSingleResponse<GetProfile | null>> => {
  return await useSupabase()
    .from("profile")
    .select("email, username, lastname, firstname, created_at")
    .eq("user_id", userId)
    .single();
};

const editUserInfo = async (
  userData: EditProfileInfoPayload,
): Promise<PostgrestResponse<GetProfile>> => {
  return await useSupabase()
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
