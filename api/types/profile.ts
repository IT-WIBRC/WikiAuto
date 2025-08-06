import type { Tables } from "../../shared/types/database.types";

export type GetProfile = Tables<"profile">;

type ProfileDataInfo = Required<GetProfile>;

export type EditProfileInfoPayload = {
  user_id: ProfileDataInfo["user_id"];
} & Partial<Omit<ProfileDataInfo, "user_id" | "email">>;
