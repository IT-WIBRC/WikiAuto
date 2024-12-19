import useSupabase from "~/api/supabaseInit";

export const Content_Status = {
  VALIDATED: "VALIDATED",
} as const;

const getTotalContent = async () => {
  return useSupabase()
    .from("contents")
    .select("content_id", { count: "exact" });
};

const getTotalContentWithStatus = async (
  status: keyof typeof Content_Status,
) => {
  return useSupabase()
    .from("contents")
    .select("content_id, status", { count: "exact" })
    .eq("status", status);
};

const getContentList = async () => {
  return useSupabase().from("contents").select(`
      content_id, status, title, user_email, updated_at,
      badges (
        name
      )
    `);
};

export const contentService = {
  statistics: {
    getTotalContent,
    getTotalContentWithStatus,
  },
  getContentList,
};
