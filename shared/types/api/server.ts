import type { ApiResponseResult } from "./common";
import type { DBSession, DBUser, UserProfileData } from "../data-access";

export type LoginDTO = {
  user: DBUser | null;
  session: DBSession | null;
};
export type GetUserProfileDTO = Omit<UserProfileData, "user_id">;

export type LogoutResponse = ApiResponseResult;
export type GetUserProfileResponse = ApiResponseResult<GetUserProfileDTO>;

type RequiredUserProfileData = Required<UserProfileData>;

export type EditUserProfileDTO = {
  user_id: RequiredUserProfileData["user_id"];
} & Partial<Omit<RequiredUserProfileData, "user_id" | "email">>;
export type EditUserProfileResponse<T = GetUserProfileDTO> =
  ApiResponseResult<T>;
