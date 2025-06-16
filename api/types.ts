import type { Tables } from "~/api/wikiAutoType";
import type { RealtimeChannel } from "@supabase/supabase-js";

export const GenericErrors = {
  NETWORK_ERROR: "NETWORK_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  NOT_FOUND: "NOT_FOUND",
  BAD_REQUEST: "BAD_REQUEST",
  REQUEST_FAILED: "REQUEST_FAILED",
} as const;

type FormError<K> = {
  property: K;
  messages: string[];
};

type ResponseErrorOnForm<K> = {
  status: "error";
  errors: FormError<K>[];
};

export type ResponseOnError = {
  status: "error";
  message: string;
};

type ResponseOnSuccess<T> = {
  status: "success";
  data: T | undefined;
};

export type ApiResponseResultWitForm<T, K = keyof T> =
  | ResponseOnError
  | ResponseOnSuccess<T>
  | ResponseErrorOnForm<K>;

export type ApiResponseResult<T = undefined> =
  | ResponseOnError
  | ResponseOnSuccess<T>;

export type GetContentListType = Omit<
  Tables<"contents">,
  "explanation" | "image"
> & {
  badges: Omit<
    Tables<"badges">,
    "badge_id" | "description" | "created_at" | "updated_at"
  >[];
};

export type GetContentDetailsType = Tables<"contents"> & {
  badges: Tables<"badges">[];
};

export type Badge = Tables<"badges">;
export type GetBadgeListTypeForOption = Omit<
  Badge,
  "description" | "created_at" | "updated_at"
>;

export const CONTENT_STATUS = {
  PENDING: "PENDING",
  VALIDATED: "VALIDATED",
  DRAFT: "DRAFT",
} as const;

export const CONTENT_RESPONSE_STATUS = {
  complete: "complete",
  incomplete: "incomplete",
  failed: "failed",
} as const;

export type ContentCreation = {
  title: string;
  explanation: string;
  illustration: File;
  badges: Badge[];
  status: keyof typeof CONTENT_STATUS;
};

export type ContentEdition = {
  id: string;
  userEmail: string;
} & ContentCreation;

// Channel types
export type SupabaseChannel = RealtimeChannel | null;

export type GetProfile = Tables<"profile">;

type UserDataInfo = Required<GetProfile>;

export type EditUserInfoPayload = {
  user_id: UserDataInfo["user_id"];
} & Partial<Omit<UserDataInfo, "user_id" | "email">>;
