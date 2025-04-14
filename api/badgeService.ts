import useSupabase from "~/api/supabaseInit";

const getBadgeListForOptions = async () => {
  return useSupabase().from("badges").select("badge_id, name");
};

const getBadgeList = async () => {
  return useSupabase().from("badges").select("*");
};

const create = async (name: string, description: string) => {
  return useSupabase().from("badges").insert({
    name,
    description,
  });
};

const edit = async (id: string, name: string, description: string) => {
  return useSupabase()
    .from("badges")
    .update({
      name,
      description,
    })
    .eq("badge_id", id);
};

const getTotalBadge = async () => {
  return useSupabase().from("badges").select("badge_id", { count: "exact" });
};

export const badgeService = {
  getBadgeListForOptions,
  getBadgeList,
  create,
  edit,
  statistics: {
    getTotalBadge,
  },
};
