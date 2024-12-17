import type { Tables } from "~/api/wikiAutoType";

export type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined;

export type IsArray<T> = T extends readonly unknown[] ? T : never;
export type IsObject<T> =
  T extends Record<string | number, unknown> ? T : never;

export type IsPrimitiveType<T> = T extends Primitive ? T : never;

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
  data: T;
};

export type ApiResponseResultWitForm<T, K = keyof T> =
  | ResponseOnError
  | ResponseOnSuccess<T>
  | ResponseErrorOnForm<K>;

export type ApiResponseResult<T> = ResponseOnError | ResponseOnSuccess<T>;

export type GetContentListType = Omit<
  Tables<"contents">,
  "explanation" | "image"
> & { badges: Omit<Tables<"badges">, "badge_id" | "description">[] };
