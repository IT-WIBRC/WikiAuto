import useSupabase from "~/api/supabaseInit";

const getBadgeListForOptions = async () => {
  return useSupabase().from("badges").select("badge_id, name");
};

const create = async (name: string, description: string) => {
  return useSupabase().from("badges").insert({
    name,
    description,
  });
};

const getTotalBadge = async () => {
  return useSupabase().from("badges").select("badge_id", { count: "exact" });
};

export const badgeService = {
  getBadgeListForOptions,
  create,
  statistics: {
    getTotalBadge,
  },
};
