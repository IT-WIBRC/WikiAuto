import type {
  ApiResponseResult,
  ApiRouteErrorBody,
  ResponseOnError,
  ResponseOnSuccess,
} from "~/shared/types/api/common";
import { Either, type IEither } from "./monads";
import type { FetchError } from "ofetch";
import {
  GenericErrors,
  type GenericErrorsKeys,
} from "~/shared/types/enums/GenericErrors";

export function isApiRouteErrorBody(data: unknown): data is ApiRouteErrorBody {
  return (
    typeof data === "object" &&
    data !== null &&
    ("code" in data || "message" in data)
  );
}

export function isApiFetchError(
  error: unknown,
): error is FetchError<ApiRouteErrorBody> {
  return (
    error instanceof Error &&
    (error as FetchError).statusCode !== undefined &&
    "data" in (error as FetchError) &&
    isApiRouteErrorBody((error as FetchError).data)
  );
}

function isFetchErrorWithResponse(error: unknown): error is FetchError & {
  response: { _data?: unknown; statusCode?: number };
} {
  return (
    error instanceof Error &&
    "response" in error &&
    (error as FetchError).response !== undefined &&
    (error as FetchError).response !== null &&
    typeof (error as FetchError).response === "object"
  );
}

function mapErrorToResponseOnError(error: unknown): ResponseOnError {
  // TODO: Remove unnecessary error handling
  let errorCode: GenericErrorsKeys = GenericErrors.SERVER_ERROR;
  let errorMessage = "An unexpected error occurred.";

  if (isFetchErrorWithResponse(error)) {
    const fetchError = error;
    const statusCode = fetchError.statusCode;
    const errorData = fetchError.response._data;

    if (isApiRouteErrorBody(errorData)) {
      errorCode = errorData.code || GenericErrors.UNKNOWN_ERROR;
      switch (statusCode) {
        case 400:
          errorCode = GenericErrors.BAD_REQUEST;
          errorMessage = errorData?.hint || "Bad request.";
          break;
        case 401:
          errorCode = GenericErrors.UNAUTHORIZED;
          errorMessage = errorData?.hint || "Unauthorized user";
          break;
        case 403:
          errorCode = GenericErrors.FORBIDDEN;
          errorMessage = errorData?.hint || "Bad request.";
          break;
        case 404:
          errorCode = GenericErrors.NOT_FOUND;
          errorMessage =
            errorData?.hint || "User is not found or could not be retrieved.";
          break;
        case 409:
          errorCode = GenericErrors.CONFLICT;
          errorMessage = errorData?.hint || "Information Conflict";
          break;
        case 429:
          errorCode = GenericErrors.RATE_LIMIT_EXCEEDED;
          errorMessage =
            errorData?.hint || "To much request made. Limit reached";
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorCode = GenericErrors.SERVER_ERROR;
          errorMessage = errorData?.hint || errorMessage;
          break;
        default:
          errorCode = GenericErrors.UNKNOWN_ERROR;
          break;
      }
    }
  } else if (
    error instanceof TypeError &&
    (error.message.includes("network") ||
      error.message.includes("Failed to fetch"))
  ) {
    errorCode = GenericErrors.NETWORK_ERROR;
    errorMessage = "Network error occurred. Please check your connection.";
  } else if (error instanceof DOMException && error.name === "AbortError") {
    errorCode = GenericErrors.NETWORK_ERROR;
  } else if (
    error instanceof Error &&
    (error.message.includes("timeout") || error.message.includes("timed out"))
  ) {
    errorCode = GenericErrors.TIMEOUT;
    errorMessage = "The request timed out. Please try again later.";
  } else if (error instanceof Error) {
    console.error(
      "Caught an unexpected error type in mapErrorToResponseOnError:",
      error.message,
      error,
    );
    errorCode = GenericErrors.UNKNOWN_ERROR;
    errorMessage = error.message || "An unexpected error occurred.";
  }

  return {
    status: "error",
    code: errorCode,
    hint: errorMessage,
  };
}

export async function wrapServiceCall<TData>(
  fetchPromise: Promise<ApiResponseResult<TData>>,
): Promise<IEither<ResponseOnError, ResponseOnSuccess<TData>>> {
  try {
    const result = await fetchPromise;

    if (result.status === "success") {
      return Either.right(result);
    } else {
      return Either.left({
        status: "error",
        hint: result.hint,
        code: result.code,
      });
    }
  } catch (error: unknown) {
    return Either.left(mapErrorToResponseOnError(error));
  }
}
