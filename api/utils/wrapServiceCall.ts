import {
  GenericErrors,
  type ApiRouteErrorBody,
  type GenericErrorsKeys,
  type UIResponseOnError,
} from "../types/apiResponse";
import { Either, type IEither } from "./monads";
import type { FetchError } from "ofetch";

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

function mapErrorToResponseOnError(error: unknown): UIResponseOnError {
  let errorCode: GenericErrorsKeys = GenericErrors.SERVER_ERROR;

  if (isFetchErrorWithResponse(error)) {
    const fetchError = error;
    const statusCode = fetchError.statusCode;
    const errorData = fetchError.response._data;

    if (isApiRouteErrorBody(errorData)) {
      errorCode = errorData.code || GenericErrors.UNKNOWN_ERROR;
    } else {
      switch (statusCode) {
        case 400:
          errorCode = GenericErrors.BAD_REQUEST;
          break;
        case 401:
          errorCode = GenericErrors.UNAUTHORIZED;
          break;
        case 403:
          errorCode = GenericErrors.FORBIDDEN;
          break;
        case 404:
          errorCode = GenericErrors.NOT_FOUND;
          break;
        case 409:
          errorCode = GenericErrors.CONFLICT;
          break;
        case 429:
          errorCode = GenericErrors.RATE_LIMIT_EXCEEDED;
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorCode = GenericErrors.SERVER_ERROR;
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
  } else if (error instanceof DOMException && error.name === "AbortError") {
    errorCode = GenericErrors.NETWORK_ERROR;
  } else if (
    error instanceof Error &&
    (error.message.includes("timeout") || error.message.includes("timed out"))
  ) {
    errorCode = GenericErrors.TIMEOUT;
  } else if (error instanceof Error) {
    console.error(
      "Caught an unexpected error type in mapErrorToResponseOnError:",
      error.message,
      error,
    );
    errorCode = GenericErrors.UNKNOWN_ERROR;
  }

  return {
    status: "error",
    message: errorCode,
  };
}

export type ServiceWrapperSuccess<TData> = {
  status: "success";
  data: TData;
};

export async function wrapServiceCall<TData>(
  fetchPromise: Promise<TData>,
): Promise<IEither<UIResponseOnError, ServiceWrapperSuccess<TData>>> {
  try {
    const result = await fetchPromise;

    interface EmbeddedErrorWrapper {
      error: ApiRouteErrorBody | null;
    }

    function hasEmbeddedError(res: unknown): res is EmbeddedErrorWrapper {
      return (
        typeof res === "object" &&
        res !== null &&
        "error" in res &&
        typeof (res as EmbeddedErrorWrapper).error === "object" &&
        (res as EmbeddedErrorWrapper).error !== null
      );
    }

    if (hasEmbeddedError(result)) {
      const embeddedError = result.error;
      return Either.left({
        status: "error",
        message: embeddedError?.code || GenericErrors.UNKNOWN_ERROR,
      });
    }

    return Either.right({
      status: "success",
      data: result,
    });
  } catch (error: unknown) {
    return Either.left(mapErrorToResponseOnError(error));
  }
}
