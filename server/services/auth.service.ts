import { useServerClient } from "~/shared/utils/api-client";
import type {
  AuthenticationResult,
  SingleResult,
  UserProfileData,
  UserResponse,
} from "~/shared/types/data-access";
import type { H3Event } from "h3";
import type {
  EditUserProfileDTO,
  GetUserProfileDTO,
} from "~/shared/types/api/server";

export async function createAuthService(event: H3Event) {
  const client = await useServerClient(event);

  return {
    async logout(): Promise<AuthenticationResult> {
      return (await client.auth.signOut({
        scope: "global",
      })) as unknown as AuthenticationResult;
    },
    async getUser(): Promise<UserResponse> {
      return await client.auth.getUser();
    },
    async fetchUserProfileById(
      userId: string,
    ): Promise<SingleResult<GetUserProfileDTO | null>> {
      return await client
        .from("profile")
        .select("email, username, lastname, firstname, created_at")
        .eq("user_id", userId)
        .single();
    },
    async updateProfileInformation(
      profileData: EditUserProfileDTO,
    ): Promise<SingleResult<UserProfileData>> {
      return await client
        .from("profile")
        .update({
          username: profileData.username,
          lastname: profileData.lastname,
          firstname: profileData.firstname,
        })
        .eq("user_id", profileData.user_id)
        .select()
        .single();
    },
  };
}
