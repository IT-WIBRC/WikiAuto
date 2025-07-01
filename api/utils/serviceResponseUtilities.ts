import type { ServiceWrapperSuccess } from "./wrapServiceCall";
import {
  GenericErrors,
  type ApiResponseResult,
  type ResponseOnError,
} from "~/api";
import { type IEither, Maybe } from "./monads";

export function isArrayOfData<TItem>(
  data: TItem[] | TItem | unknown,
): data is TItem[] {
  return Array.isArray(data);
}

export function isObjectOfData<TObject>(
  data: TObject[] | TObject | unknown,
): data is TObject {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}

type CommonHandlers<TResult> = {
  onError: (errorMessage: string) => TResult;
};

type SingleItemHandlers<TItem, TResult> = {
  onFound: (data: TItem, count: number | null | undefined) => TResult;
  onNotFound?: (count: number | null | undefined) => TResult;
} & CommonHandlers<TResult>;

type ListHandlers<TItem, TResult> = {
  onFoundList: (data: TItem[], count: number | null | undefined) => TResult;
  onEmptyList?: (count: number | null | undefined) => TResult;
} & CommonHandlers<TResult>;

export function handleSingleItemResponse<TItem, TResult>(
  eitherResponse: IEither<
    ResponseOnError,
    ServiceWrapperSuccess<TItem | TItem[]>
  >,
  handlers: SingleItemHandlers<TItem, TResult>,
): TResult {
  return eitherResponse.fold(
    (error) => handlers.onError(error.message),
    (successResponse) => {
      return Maybe.fromNullable(successResponse.data).fold(
        () =>
          handlers.onNotFound
            ? handlers.onNotFound(successResponse.count)
            : handlers.onError(GenericErrors.NOT_FOUND),
        (data) => {
          if (isObjectOfData<TItem>(data)) {
            return handlers.onFound(data, successResponse.count);
          } else {
            return handlers.onNotFound
              ? handlers.onNotFound(successResponse.count)
              : handlers.onError(GenericErrors.NOT_FOUND);
          }
        },
      );
    },
  );
}

export function handleListResponse<TItem, TResult>(
  eitherResponse: IEither<
    ResponseOnError,
    ServiceWrapperSuccess<TItem | TItem[]>
  >,
  handlers: ListHandlers<TItem, TResult>,
): TResult {
  return eitherResponse.fold(
    (error) => handlers.onError(error.message),
    (successResponse) => {
      return Maybe.fromNullable(successResponse.data).fold(
        () =>
          handlers.onEmptyList
            ? handlers.onEmptyList(successResponse.count)
            : handlers.onFoundList([], successResponse.count),
        (data) => {
          if (isArrayOfData<TItem>(data)) {
            if (data.length === 0) {
              return handlers.onEmptyList
                ? handlers.onEmptyList(successResponse.count)
                : handlers.onFoundList([], successResponse.count);
            }
            return handlers.onFoundList(data, successResponse.count);
          } else {
            return handlers.onEmptyList
              ? handlers.onEmptyList(successResponse.count)
              : handlers.onError(GenericErrors.UNKNOWN_ERROR);
          }
        },
      );
    },
  );
}

export function processEitherResult<TSuccessData, TReturnData>(
  eitherResult: IEither<ResponseOnError, ServiceWrapperSuccess<TSuccessData>>,
  onSuccessTransform: (
    data: TSuccessData | null,
    count?: number | null,
  ) => TReturnData,
): ApiResponseResult<TReturnData> {
  function onError(
    errorValue: ResponseOnError,
  ): ApiResponseResult<TReturnData> {
    return {
      status: "error",
      message: errorValue.message,
    };
  }

  function onSuccess(
    successValue: ServiceWrapperSuccess<TSuccessData>,
  ): ApiResponseResult<TReturnData> {
    const transformedData = onSuccessTransform(
      successValue.data,
      successValue.count,
    );
    if (typeof transformedData === "undefined") {
      return { status: "success" } as ApiResponseResult<TReturnData>;
    } else {
      return {
        status: "success",
        data: transformedData,
      } as ApiResponseResult<TReturnData>;
    }
  }
  return eitherResult.fold(onError, onSuccess);
}
