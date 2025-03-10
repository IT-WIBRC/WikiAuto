import useSupabase from "~/api/supabaseInit";
import type {
  ContentCreation,
  CONTENT_STATUS,
  ContentEdition,
  CONTENT_RESPONSE_STATUS,
} from "~/api/types";

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
      content_id, status, title, user_email, updated_at, image, created_at, explanation,
      badges (
        name,
        badge_id,
        description
      )
    `);
};

const saveInContentBadge = (contentId: string, badgeIds: string[]) => {
  return useSupabase()
    .from("content_badges")
    .upsert(
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
  status: keyof CONTENT_RESPONSE_STATUS;
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

type ContentEditionTypeForService = Omit<ContentEdition, "illustration"> & {
  illustration: string;
};
const edit = async (
  content: ContentEditionTypeForService,
): Promise<{
  status: keyof CONTENT_RESPONSE_STATUS;
  error?: unknown;
}> => {
  const { id, title, explanation, illustration, badges, status, userEmail } =
    content;

  const contentEdited = await useSupabase()
    .from("contents")
    .upsert({
      content_id: id,
      title,
      explanation,
      status,
      user_email: userEmail,
      image: illustration,
    })
    .select("content_id")
    .limit(1)
    .single();

  if (contentEdited.data && contentEdited.data.content_id) {
    const badgeId = contentEdited.data.content_id;

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
    error: contentEdited.error,
  };
};

export const contentService = {
  statistics: {
    getTotalContent,
    getTotalContentWithStatus,
  },
  getContentList,
  create,
  edit,
};
