import type { GenericErrorsKeys } from "../enums/GenericErrors";

export type AvailableApiStatus = "success" | "error";

interface ResponseOnSuccessWithNoData {
  status: Extract<AvailableApiStatus, "success">;
};

interface ResponseOnSuccessWithData<T> extends ResponseOnSuccessWithNoData {
  data: T;
};

export type ResponseOnSuccess<T = undefined> = T extends undefined
  ? ResponseOnSuccessWithNoData
  : ResponseOnSuccessWithData<T>;

export type ResponseOnError = {
  status: Extract<AvailableApiStatus, "error">;
  hint?: string;
  code: GenericErrorsKeys;
};

export type ApiResponseResult<T = undefined> =
  | ResponseOnSuccess<T>
  | ResponseOnError;

export type ApiRouteErrorBody = Omit<ResponseOnError, "status">;
