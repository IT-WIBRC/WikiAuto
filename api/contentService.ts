import useSupabase from "~/api/supabaseInit";

export const Content_Status = {
  VALIDATED: "VALIDATED",
} as const;

const getTotalContent = (): Promise<number> => {
  return useSupabase()
    .from("contents")
    .select("content_id", { count: "exact" });
};

const getTotalContentWithStatus = (
  status: keyof typeof Content_Status,
): Promise<number> => {
  return useSupabase()
    .from("contents")
    .select("content_id, status", { count: "exact" })
    .eq("contents.status", status);
};

export const contentService = {
  statistics: {
    getTotalContent,
    getTotalContentWithStatus,
  },
};
