import { useDatabaseClient } from "../utils/database-client";
import type {
  AuthenticationResult,
  LoginResult,
  SingleResult,
  EditProfileInfoPayload,
  GetProfile,
} from "~/shared/types/data-access";

const loginUser = async (
  emailAddress: string,
  userPassword: string,
): Promise<LoginResult> => {
  return await useDatabaseClient().auth.signInWithPassword({
    email: emailAddress,
    password: userPassword,
  });
};

const logoutUser = async (): Promise<AuthenticationResult> => {
  return (await useDatabaseClient().auth.signOut({
    scope: "global",
  })) as unknown as AuthenticationResult;
};

const fetchUserProfileById = async (
  userId: string,
): Promise<SingleResult<GetProfile | null>> => {
  return await useDatabaseClient()
    .from("profile")
    .select("email, username, lastname, firstname, created_at")
    .eq("user_id", userId)
    .single();
};

const updateProfileInformation = async (
  profileData: EditProfileInfoPayload,
): Promise<SingleResult<GetProfile>> => {
  return await useDatabaseClient()
    .from("profile")
    .update({
      username: profileData.username,
      lastname: profileData.lastname,
      firstname: profileData.firstname,
    })
    .eq("user_id", profileData.user_id)
    .select()
    .single();
};

export const authService = {
  login: loginUser,
  logout: logoutUser,
  fetchUserProfileById,
  updateProfileInformation,
};
