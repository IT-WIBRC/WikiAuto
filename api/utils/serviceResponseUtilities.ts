import { type IEither, Maybe } from "./monads";
import type {
  ApiResponseResult,
  ResponseOnError,
  ResponseOnSuccessWithData,
  ResponseOnSuccessWithNoData,
} from "~/shared/types/api/common";
import { GenericErrors } from "~/shared/types/enums/GenericErrors";

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
  onError: (error: ResponseOnError) => TResult;
};

type SingleItemHandlers<TItem, TResult> = {
  onFound: (data: TItem) => TResult;
  onNotFound?: (error: ResponseOnError) => TResult;
} & CommonHandlers<TResult>;

type ListHandlers<TItem, TResult> = {
  onFoundList: (data: TItem[]) => TResult;
  onEmptyList?: () => TResult;
} & CommonHandlers<TResult>;

export function handleSingleItemResponse<TItem, TResult>(
  eitherResponse: IEither<
    ResponseOnError,
    ResponseOnSuccessWithNoData | ResponseOnSuccessWithData<TItem>
  >,
  handlers: SingleItemHandlers<TItem, TResult>,
): TResult {
  return eitherResponse.fold(
    (error) => handlers.onError(error),
    (successResponse) => {
      if ("data" in successResponse) {
        return Maybe.fromNullable(successResponse.data).fold(
          () =>
            handlers.onNotFound
              ? handlers.onNotFound({
                  status: "error",
                  code: GenericErrors.NOT_FOUND,
                  hint: "Data not found",
                })
              : handlers.onError({
                  status: "error",
                  code: GenericErrors.NOT_FOUND,
                  hint: "Data not found",
                }),
          (data) => {
            if (isObjectOfData<TItem>(data)) {
              return handlers.onFound(data);
            } else {
              return handlers.onNotFound
                ? handlers.onNotFound({
                    status: "error",
                    code: GenericErrors.NOT_FOUND,
                    hint: "Data not found",
                  })
                : handlers.onError({
                    status: "error",
                    code: GenericErrors.NOT_FOUND,
                    hint: "Data not found",
                  });
            }
          },
        );
      } else {
        return handlers.onNotFound
          ? handlers.onNotFound({
              status: "error",
              code: GenericErrors.NOT_FOUND,
              hint: "Data not found",
            })
          : handlers.onError({
              status: "error",
              code: GenericErrors.NOT_FOUND,
              hint: "Data not found",
            });
      }
    },
  );
}

export function handleListResponse<TItem, TResult>(
  eitherResponse: IEither<
    ResponseOnError,
    ResponseOnSuccessWithNoData | ResponseOnSuccessWithData<TItem[]>
  >,
  handlers: ListHandlers<TItem, TResult>,
): TResult {
  return eitherResponse.fold(
    (error) => handlers.onError(error),
    (successResponse) => {
      if ("data" in successResponse) {
        return Maybe.fromNullable(successResponse.data).fold(
          () =>
            handlers.onEmptyList
              ? handlers.onEmptyList()
              : handlers.onFoundList([]),
          (data) => {
            if (isArrayOfData<TItem>(data)) {
              if (data.length === 0) {
                return handlers.onEmptyList
                  ? handlers.onEmptyList()
                  : handlers.onFoundList([]);
              }
              return handlers.onFoundList(data);
            } else {
              return handlers.onError({
                status: "error",
                code: GenericErrors.UNKNOWN_ERROR,
                hint: "Unexpected data format",
              });
            }
          },
        );
      } else {
        return handlers.onEmptyList
          ? handlers.onEmptyList()
          : handlers.onFoundList([]);
      }
    },
  );
}

export function processEitherResult<TSuccessData, TReturnData>(
  eitherResult: IEither<
    ResponseOnError,
    ResponseOnSuccessWithNoData | ResponseOnSuccessWithData<TSuccessData>
  >,
  onSuccessTransform: (data: TSuccessData | null) => TReturnData,
): ApiResponseResult<TReturnData> {
  function onError(
    errorValue: ResponseOnError,
  ): ApiResponseResult<TReturnData> {
    return {
      status: "error",
      code: errorValue.code ?? GenericErrors.UNKNOWN_ERROR,
      hint: errorValue.hint ?? "An unexpected error occurred.",
    };
  }

  function onSuccess(
    successValue:
      | ResponseOnSuccessWithNoData
      | ResponseOnSuccessWithData<TSuccessData>,
  ): ApiResponseResult<TReturnData> {
    const transformedData =
      "data" in successValue
        ? onSuccessTransform(successValue.data ?? null)
        : onSuccessTransform(null);

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
