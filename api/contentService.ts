import useSupabase from "~/api/supabaseInit";

const getTotalContent = (): Promise<number> => {
  return useSupabase()
    .from("contents")
    .select("content_id", { count: "exact" });
};

export const contentService = {
  statistics: {
    getTotalContent,
  },
};
