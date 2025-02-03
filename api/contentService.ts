import useSupabase from "~/api/supabaseInit";
import type { ContentCreation, CONTENT_STATUS } from "~/api/types";

const getTotalContent = async () => {
  return useSupabase()
    .from("contents")
    .select("content_id", { count: "exact" });
};

const getTotalContentWithStatus = async (
  status: keyof typeof CONTENT_STATUS,
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

const saveInContentBadge = (contentId: string, badgeIds: string[]) => {
  return useSupabase()
    .from("content_badges")
    .insert(
      badgeIds.map((badgeId) => ({
        badge_id: badgeId,
        content_id: contentId,
      })),
    );
};

type ContentCreationTypeForService = Omit<ContentCreation, "illustration"> & {
  illustration: string;
};
const create = async (
  content: ContentCreationTypeForService,
  userEmail: string,
): Promise<{
  status: "incomplete" | "completed" | "failed";
  error?: unknown;
}> => {
  const { title, explanation, illustration, badges, status } = content;

  const contentCreated = await useSupabase()
    .from("contents")
    .insert({
      title,
      explanation,
      user_email: userEmail,
      status,
      image: illustration,
    })
    .select("content_id")
    .limit(1)
    .single();

  if (contentCreated.data && contentCreated.data.content_id) {
    const badgeId = contentCreated.data.content_id;

    const badgesCreated = await saveInContentBadge(
      badgeId,
      badges.map((badge) => badge.badge_id),
    );

    const haveBeenCreatedSuccessfully = badgesCreated.error === null;
    if (haveBeenCreatedSuccessfully) {
      return {
        status: "completed",
      };
    }
    return {
      status: "incomplete",
      error: badgesCreated.error,
    };
  }
  return {
    status: "failed",
    error: contentCreated.error,
  };
};

export const contentService = {
  statistics: {
    getTotalContent,
    getTotalContentWithStatus,
  },
  getContentList,
  create,
};
