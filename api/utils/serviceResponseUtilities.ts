import type { ServiceWrapperSuccess } from "./wrapServiceCall";
import {
  GenericErrors,
} from "../types/apiResponse";
import { type IEither, Maybe } from "./monads";
import type { UIApiResponseResult, UIResponseOnError } from "../types/apiResponse";

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
  onFound: (data: TItem) => TResult;
  onNotFound?: () => TResult;
} & CommonHandlers<TResult>;

type ListHandlers<TItem, TResult> = {
  onFoundList: (data: TItem[] | number) => TResult;
  onEmptyList?: () => TResult;
  onListCount?: (data: number) => TResult;
} & CommonHandlers<TResult>;

export function handleSingleItemResponse<TItem, TResult>(
  eitherResponse: IEither<
    UIResponseOnError,
    ServiceWrapperSuccess<TItem | TItem[]>
  >,
  handlers: SingleItemHandlers<TItem, TResult>,
): TResult {
  return eitherResponse.fold(
    (error) => handlers.onError(error.message ?? GenericErrors.UNKNOWN_ERROR),
    (successResponse) => {
      return Maybe.fromNullable(successResponse.data).fold(
        () =>
          handlers.onNotFound
            ? handlers.onNotFound()
            : handlers.onError(GenericErrors.NOT_FOUND),
        (data) => {
          if (isObjectOfData<TItem>(data)) {
            return handlers.onFound(data);
          } else {
            return handlers.onNotFound
              ? handlers.onNotFound()
              : handlers.onError(GenericErrors.NOT_FOUND);
          }
        },
      );
    },
  );
}

export function handleListResponse<TItem, TResult>(
  eitherResponse: IEither<
    UIResponseOnError,
    ServiceWrapperSuccess<TItem | TItem[] | number>
  >,
  handlers: ListHandlers<TItem, TResult>,
): TResult {
  return eitherResponse.fold(
    (error) => handlers.onError(error.message ?? GenericErrors.UNKNOWN_ERROR),
    (successResponse) => {
      return Maybe.fromNullable(successResponse.data).fold(
        () =>
          handlers.onEmptyList
            ? handlers.onEmptyList()
            : handlers.onFoundList([]),
        (data) => {
          if (typeof data === "number" && !isNaN(data)) {
            if (handlers.onListCount) {
              return handlers.onListCount(data);
            }
            return handlers.onEmptyList
              ? handlers.onEmptyList()
              : handlers.onFoundList([]);
          }
          if (isArrayOfData<TItem>(data)) {
            if (data.length === 0) {
              return handlers.onEmptyList
                ? handlers.onEmptyList()
                : handlers.onFoundList([]);
            }
            return handlers.onFoundList(data);
          } else {
            return handlers.onEmptyList
              ? handlers.onEmptyList()
              : handlers.onError(GenericErrors.UNKNOWN_ERROR);
          }
        },
      );
    },
  );
}

export function processEitherResult<TSuccessData, TReturnData>(
  eitherResult: IEither<UIResponseOnError, ServiceWrapperSuccess<TSuccessData>>,
  onSuccessTransform: (
    data: TSuccessData | null,
    count?: number | null,
  ) => TReturnData,
): UIApiResponseResult<TReturnData> {
  function onError(
    errorValue: UIResponseOnError,
  ): UIApiResponseResult<TReturnData> {
    return {
      status: "error",
      message: errorValue.message ?? GenericErrors.UNKNOWN_ERROR,
    };
  }

  function onSuccess(
    successValue: ServiceWrapperSuccess<TSuccessData>,
  ): UIApiResponseResult<TReturnData> {
    const transformedData = onSuccessTransform(
      successValue.data,
    );
    if (typeof transformedData === "undefined") {
      return { status: "success" } as UIApiResponseResult<TReturnData>;
    } else {
      return {
        status: "success",
        data: transformedData,
      } as UIApiResponseResult<TReturnData>;
    }
  }
  return eitherResult.fold(onError, onSuccess);
}
