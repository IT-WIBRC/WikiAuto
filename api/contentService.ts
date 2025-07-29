import useSupabase from "~/api/utils/supabaseInit";
import type {
  ContentCreation,
  CONTENT_STATUS,
  ContentEdition,
  Content,
  GetContentListItem,
} from "./types/content";
import type {
  PostgrestSingleResponse,
  PostgrestError,
} from "@supabase/supabase-js";
import type { PostgrestResponseFailure } from "@supabase/postgrest-js";

export type ContentIdResponse = { content_id: string };
type ContentServiceResponse = PostgrestSingleResponse<ContentIdResponse | null>;

const getTotalContent = async (): Promise<
  PostgrestSingleResponse<Pick<Content, "content_id">[]>
> => {
  return useSupabase()
    .from("contents")
    .select("content_id", { count: "exact" });
};

const getTotalContentWithStatus = async (
  status: keyof typeof CONTENT_STATUS,
): Promise<
  PostgrestSingleResponse<Pick<Content, "content_id" | "status">[]>
> => {
  return useSupabase()
    .from("contents")
    .select("content_id, status", { count: "exact" })
    .eq("status", status);
};

const getContentList = async (): Promise<
  PostgrestSingleResponse<GetContentListItem[]>
> => {
  return useSupabase().from("contents").select(`
      content_id, status, title, user_email, updated_at, image, created_at, explanation,
      badges (
        name,
        badge_id,
        description
      )
    `);
};

const linkBadgesToContent = (contentId: string, badgeIds: string[]) => {
  return useSupabase()
    .from("content_badges")
    .upsert(
      badgeIds.map((badgeId) => ({
        badge_id: badgeId,
        content_id: contentId,
      })),
    );
};

const makePostgrestError = (
  code: string,
  message: string,
  details: string,
  status: number,
  statusText: string,
): PostgrestResponseFailure => ({
  error: {
    code,
    message,
    details,
    hint: "",
  } as PostgrestError,
  data: null,
  count: null,
  status,
  statusText,
});

const foreignKeyErrorResponse = (
  badgeIds: string[],
): PostgrestResponseFailure =>
  makePostgrestError(
    "23503",
    'insert or update on table "content_badges" violates foreign key constraint',
    `Key (badge_id)=(${badgeIds.join(", ")}) is not present in table "badges".`,
    409,
    "Conflict",
  );

const notNullErrorResponse = (): PostgrestResponseFailure =>
  makePostgrestError(
    "23502",
    'null value in column "badge_id" violates not-null constraint',
    "No badges provided.",
    400,
    "Bad Request",
  );

type ContentCreationInput = Omit<ContentCreation, "illustration"> & {
  illustration: string;
};

const createContent = async (
  content: ContentCreationInput,
  userEmail: string,
): Promise<ContentServiceResponse> => {
  if (!content.badges || content.badges.length === 0) {
    return notNullErrorResponse();
  }

  const badgeIds = content.badges.map((badge) => badge.badge_id);

  const { data: existingBadges, error: badgeCheckError } = await useSupabase()
    .from("badges")
    .select("badge_id")
    .in("badge_id", badgeIds);

  if (badgeCheckError) {
    return makePostgrestError(
      badgeCheckError.code || "400",
      badgeCheckError.message,
      badgeCheckError.details || "",
      400,
      "Bad Request",
    );
  }

  const existingBadgeIds = (existingBadges ?? []).map((b) => b.badge_id);
  const missingBadgeIds = badgeIds.filter(
    (id) => !existingBadgeIds.includes(id),
  );
  if (missingBadgeIds.length > 0) {
    return foreignKeyErrorResponse(missingBadgeIds);
  }

  const { title, explanation, illustration, status } = content;
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

  if (!contentCreated.data || !contentCreated.data.content_id) {
    return {
      ...contentCreated,
      data: null,
    };
  }

  const badgeLinkResult = await linkBadgesToContent(
    contentCreated.data.content_id,
    badgeIds,
  );

  if (badgeLinkResult.error !== null) {
    return makePostgrestError(
      badgeLinkResult.error.code || "400",
      badgeLinkResult.error.message,
      badgeLinkResult.error.details || "",
      400,
      "Bad Request",
    );
  }

  return {
    error: null,
    data: { content_id: contentCreated.data.content_id },
    count: null,
    status: 201,
    statusText: "Created",
  };
};

type ContentEditionInput = Omit<ContentEdition, "illustration"> & {
  illustration: string;
};

const editContent = async (
  content: ContentEditionInput,
): Promise<ContentServiceResponse> => {
  if (!content.badges || content.badges.length === 0) {
    return notNullErrorResponse();
  }

  const badgeIds = content.badges.map((badge) => badge.badge_id);

  const { data: existingBadges, error: badgeCheckError } = await useSupabase()
    .from("badges")
    .select("badge_id")
    .in("badge_id", badgeIds);

  if (badgeCheckError) {
    return makePostgrestError(
      badgeCheckError.code || "400",
      badgeCheckError.message,
      badgeCheckError.details || "",
      400,
      "Bad Request",
    );
  }

  const existingBadgeIds = (existingBadges ?? []).map((b) => b.badge_id);
  const missingBadgeIds = badgeIds.filter(
    (id) => !existingBadgeIds.includes(id),
  );
  if (missingBadgeIds.length > 0) {
    return foreignKeyErrorResponse(missingBadgeIds);
  }

  const { id, title, explanation, illustration, status, userEmail } = content;

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

  if (!contentEdited.data || !contentEdited.data.content_id) {
    return {
      ...contentEdited,
      data: null,
    };
  }

  const badgeLinkResult = await linkBadgesToContent(
    contentEdited.data.content_id,
    badgeIds,
  );

  if (badgeLinkResult.error !== null) {
    return makePostgrestError(
      badgeLinkResult.error.code || "400",
      badgeLinkResult.error.message,
      badgeLinkResult.error.details || "",
      400,
      "Bad Request",
    );
  }

  return {
    error: null,
    data: { content_id: contentEdited.data.content_id },
    count: null,
    status: 200,
    statusText: "OK",
  };
};

const editStatus = async (
  status: keyof typeof CONTENT_STATUS,
  contentId: string,
): Promise<PostgrestSingleResponse<null>> => {
  return await useSupabase()
    .from("contents")
    .update({
      status,
    })
    .eq("content_id", contentId);
};

export const contentService = {
  statistics: {
    getTotalContent,
    getTotalContentWithStatus,
  },
  getContentList,
  create: createContent,
  edit: editContent,
  editStatus,
};
