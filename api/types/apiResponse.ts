import type { RealtimeChannel } from "@supabase/supabase-js";

export const GenericErrors = {
  NETWORK_ERROR: "NETWORK_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  NOT_FOUND: "NOT_FOUND",
  BAD_REQUEST: "BAD_REQUEST",
  REQUEST_FAILED: "REQUEST_FAILED",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  CONFLICT: "CONFLICT",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  TIMEOUT: "TIMEOUT",
  NO_DATA_FOUND: "NO_DATA_FOUND",
  UPLOAD_FAILED_NO_PATH: "UPLOAD_FAILED_NO_PATH",
} as const;

type FormError<K> = {
  property: K;
  messages: string[];
};

type ResponseErrorOnForm<K> = {
  status: "error";
  errors: FormError<K>[];
};

export type GenericErrorsKeys = keyof typeof GenericErrors;
export type ResponseOnError = {
  status: "error";
  message?: string;
  code: GenericErrorsKeys;
};

export type UIResponseOnError = Omit<ResponseOnError, "code"> & {
  message: string;
};

export type ApiRouteErrorBody = {
  code: GenericErrorsKeys;
  message?: string;
};

type ResponseOnSuccessWithData<T> = {
  status: "success";
  data: T;
};

type ResponseOnSuccessWithNoData = {
  status: "success";
};

type ResponseOnSuccess<T> = T extends undefined
  ? ResponseOnSuccessWithNoData
  : ResponseOnSuccessWithData<T>;

export type ApiResponseResultWitForm<T, K = keyof T> =
  | ResponseOnError
  | ResponseOnSuccess<T>
  | ResponseErrorOnForm<K>;

export type ApiResponseResult<T> = ResponseOnError | ResponseOnSuccess<T>;
export type UIApiResponseResult<T> = UIResponseOnError | ResponseOnSuccess<T>;

export type SupabaseChannel = RealtimeChannel | null;
