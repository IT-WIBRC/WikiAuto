import type { Tables } from "./db";

export type GetProfile = Tables<"profile">;

type ProfileDataInfo = Required<GetProfile>;

export type EditProfileInfoPayload = {
  user_id: ProfileDataInfo["user_id"];
} & Partial<Omit<ProfileDataInfo, "user_id" | "email">>;
