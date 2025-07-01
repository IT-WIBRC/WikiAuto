import {
  type PostgrestResponse,
  type PostgrestSingleResponse,
  type AuthResponse,
  type AuthError,
  type PostgrestError,
  isAuthError,
  type AuthTokenResponsePassword,
} from "@supabase/supabase-js";
import {
  type StorageError,
  type FileObject,
  isStorageError,
} from "@supabase/storage-js";
import { GenericErrors, type ResponseOnError } from "~/api";
import { Either, type IEither } from "./monads";

type SupabaseDataResponse<T> =
  | PostgrestResponse<T>
  | PostgrestSingleResponse<T>;

type SupabaseAuthResponse = AuthResponse | AuthTokenResponsePassword;

type SupabaseStorageUploadResponse = {
  data: { path: string; id: string; fullPath: string } | null;
  error: StorageError | null;
};

type SupabaseStorageGetPublicUrl = {
  data: { publicUrl: string };
  error?: null;
};

type SupabaseStorageListResponse = {
  data: FileObject[] | null;
  error: StorageError | null;
};

type SupabaseStorageDownloadResponse = {
  data: Blob | null;
  error: StorageError | null;
};

type SupabaseClientResponse =
  | SupabaseDataResponse<unknown>
  | SupabaseAuthResponse
  | SupabaseStorageUploadResponse
  | SupabaseStorageListResponse
  | SupabaseStorageGetPublicUrl
  | SupabaseStorageDownloadResponse;

function isPostgrestDataResponse(
  response: SupabaseClientResponse,
): response is SupabaseDataResponse<unknown> {
  return (
    "status" in response &&
    typeof (response as { status: unknown }).status === "number" &&
    "statusText" in response &&
    typeof (response as { statusText: unknown }).statusText === "string" &&
    "data" in response &&
    "error" in response
  );
}

function isAuthClientResponse(
  response: SupabaseClientResponse,
): response is SupabaseAuthResponse {
  return (
    "data" in response &&
    ("user" in (response as AuthResponse).data ||
      "session" in (response as AuthResponse).data) &&
    "error" in response
  );
}

function isStorageClientResponse(
  response: SupabaseClientResponse,
): response is
  | SupabaseStorageUploadResponse
  | SupabaseStorageListResponse
  | SupabaseStorageDownloadResponse {
  return (
    "data" in response &&
    "error" in response &&
    !isPostgrestDataResponse(response) &&
    !isAuthClientResponse(response) &&
    ((response as { error: unknown }).error === null ||
      isStorageError((response as { error: unknown }).error))
  );
}

function mapSupabaseError(
  error: PostgrestError | AuthError | StorageError,
): string {
  if (
    isAuthError(error) ||
    ("name" in error &&
      typeof error.name === "string" &&
      error.name.startsWith("Auth"))
  ) {
    const authError = error as AuthError;
    switch (authError.message) {
      case "Invalid login credentials":
      case "Email or password are not valid":
      case "Invalid email or password":
      case "invalid_credentials":
        return GenericErrors.UNAUTHORIZED;
      case "User already registered":
      case "Email already registered":
      case "email_exists":
      case "duplicate_user":
        return GenericErrors.CONFLICT;
      case "Email not confirmed":
      case "email_not_confirmed":
        return GenericErrors.EMAIL_NOT_VERIFIED;
      case "Too Many Requests":
      case "throttled":
      case "request_throttled":
        return GenericErrors.RATE_LIMIT_EXCEEDED;
      case "User not found":
      case "not_found":
        return GenericErrors.NOT_FOUND;
      default:
        return GenericErrors.UNKNOWN_ERROR;
    }
  } else if ("code" in error && typeof error.code === "string") {
    const pgError = error as PostgrestError;
    switch (pgError.code) {
      case "22P02":
      case "23502":
      case "23503":
      case "23505":
      case "P0001":
      case "400":
      case "PGRST100":
      case "PGRST102":
        return GenericErrors.BAD_REQUEST;

      case "401":
      case "PGRST301":
        return GenericErrors.UNAUTHORIZED;
      case "403":
      case "42501":
        return GenericErrors.FORBIDDEN;
      case "404":
      case "42P01":
      case "42703":
      case "PGRST202":
        return GenericErrors.NOT_FOUND;
      case "409":
        return GenericErrors.CONFLICT;
      case "429":
        return GenericErrors.RATE_LIMIT_EXCEEDED;
      case "500":
      case "503":
      case "504":
      case "544":
        return GenericErrors.SERVER_ERROR;
      default:
        return GenericErrors.UNKNOWN_ERROR;
    }
  } else if ("name" in error && error.name === "StorageError") {
    const storageError = error as StorageError;
    switch (storageError.message) {
      case "The resource was not found":
        return GenericErrors.NOT_FOUND;
      case "Unauthorized":
        return GenericErrors.UNAUTHORIZED;
      case "You do not have permission to perform this action":
        return GenericErrors.FORBIDDEN;
      case "Too many requests":
        return GenericErrors.RATE_LIMIT_EXCEEDED;
      case "Invalid body":
        return GenericErrors.BAD_REQUEST;
      default:
        return GenericErrors.UNKNOWN_ERROR;
    }
  }

  return GenericErrors.UNKNOWN_ERROR;
}

export type ServiceWrapperSuccess<TData> = {
  status: "success";
  data: TData | null;
  count?: number | null;
};

type InferServicePromiseSuccessData<
  TPromiseResult extends SupabaseClientResponse,
> =
  TPromiseResult extends SupabaseDataResponse<infer D>
    ? Exclude<D, null>
    : TPromiseResult extends SupabaseAuthResponse
      ? Exclude<TPromiseResult["data"], null>
      : TPromiseResult extends SupabaseStorageUploadResponse
        ? Exclude<TPromiseResult["data"], null>
        : TPromiseResult extends SupabaseStorageListResponse
          ? Exclude<TPromiseResult["data"], null>
          : TPromiseResult extends
                | SupabaseStorageDownloadResponse
                | SupabaseStorageDownloadResponse
                | SupabaseStorageGetPublicUrl
            ? Exclude<TPromiseResult["data"], null>
            : unknown;

export async function wrapServiceCall<
  TPromise extends Promise<SupabaseClientResponse>,
  TActualData = InferServicePromiseSuccessData<Awaited<TPromise>>,
>(
  servicePromise: TPromise,
): Promise<IEither<ResponseOnError, ServiceWrapperSuccess<TActualData>>> {
  try {
    const result = await servicePromise;

    if (result.error) {
      const errorMessage = mapSupabaseError(result.error);
      return Either.left({
        status: "error",
        message: errorMessage,
      });
    }

    let dataToReturn: TActualData | null = null;
    let countToReturn: number | null | undefined = undefined;

    if (isPostgrestDataResponse(result)) {
      dataToReturn = result.data as TActualData | null;
      countToReturn = result.count;
    } else if (isAuthClientResponse(result)) {
      dataToReturn = result.data as TActualData | null;
    } else if (isStorageClientResponse(result)) {
      dataToReturn = result.data as TActualData | null;
    } else {
      console.warn(
        "wrapServiceCall received an unexpected successful response structure:",
        result,
      );
      dataToReturn = null;
    }

    return Either.right({
      status: "success",
      data: dataToReturn,
      count: countToReturn,
    });
  } catch (error: unknown) {
    let errorMessage: string = GenericErrors.SERVER_ERROR;

    if (
      error instanceof TypeError &&
      (error.message.includes("network") ||
        error.message.includes("Failed to fetch"))
    ) {
      errorMessage = GenericErrors.NETWORK_ERROR;
    } else if (error instanceof DOMException && error.name === "AbortError") {
      errorMessage = GenericErrors.NETWORK_ERROR;
    } else if (
      error instanceof Error &&
      (error.message.includes("timeout") || error.message.includes("timed out"))
    ) {
      errorMessage = GenericErrors.TIMEOUT;
    } else if (error instanceof Error) {
      console.error(
        "Caught a non-Supabase related error in wrapServiceCall:",
        error.message,
      );
      errorMessage = error.message;
    }

    return Either.left({
      status: "error",
      message: errorMessage,
    });
  }
}
