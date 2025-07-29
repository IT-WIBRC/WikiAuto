import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import useSupabase from "~/api/utils/supabaseInit";
import type { Badge, GetBadgeListTypeForOption } from "./types/badge";

const getBadgeListForOptions = async (): Promise<
  PostgrestSingleResponse<GetBadgeListTypeForOption[]>
> => {
  return useSupabase().from("badges").select("badge_id, name");
};

const getBadgeList = async (): Promise<PostgrestResponse<Badge>> => {
  return useSupabase().from("badges").select("*");
};

const create = async (
  name: string,
  description: string,
): Promise<PostgrestSingleResponse<null>> => {
  return useSupabase().from("badges").insert({
    name,
    description,
  });
};

const edit = async (
  id: string,
  name: string,
  description: string,
): Promise<PostgrestSingleResponse<null>> => {
  return useSupabase()
    .from("badges")
    .update({
      name,
      description,
    })
    .eq("badge_id", id);
};

const countAllBadges = async (): Promise<
  PostgrestSingleResponse<Pick<Badge, "badge_id">[]>
> => {
  return useSupabase().from("badges").select("badge_id", { count: "exact" });
};

export const badgeService = {
  getBadgeListForOptions,
  getBadgeList,
  create,
  edit,
  statistics: {
    countAllBadges,
  },
};
