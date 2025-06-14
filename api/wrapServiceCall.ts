import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { GenericErrors, type ResponseOnError } from "~/api/types";

type ServiceResponse<V> = PostgrestResponse<V> | PostgrestSingleResponse<V>;

type ExtractDataType<T> = T extends Promise<{ data: infer D }> ? D : never;

type ResponseOnSuccess<T> = {
  status: "success";
  response: {
    data: ExtractDataType<T>;
    count: ServiceResponse<T>["count"];
  };
};

type WrapperResult<U> = ResponseOnError | ResponseOnSuccess<U>;

export async function wrapServiceCall<SupabaseReturn extends Promise<unknown>>(
  servicePromise: SupabaseReturn,
): Promise<WrapperResult<SupabaseReturn>> {
  try {
    const result = (await servicePromise) as ServiceResponse<unknown>;
    const error = result.error;

    if (!error) {
      return {
        status: "success",
        response: {
          count: result.count,
          data: (result as { data: ExtractDataType<SupabaseReturn> }).data,
        },
      };
    }

    switch (error.code) {
      case "invalid_credentials":
      case "MissingParameter":
      case "InvalidKey":
        return {
          status: "error",
          message: GenericErrors.BAD_REQUEST,
        };
      case "NotFound":
        return {
          status: "error",
          message: GenericErrors.NOT_FOUND,
        };
      case "RequestFailed":
        return {
          status: "error",
          message: GenericErrors.REQUEST_FAILED,
        };
      case "NetworkError":
        return {
          status: "error",
          message: GenericErrors.NETWORK_ERROR,
        };
      case "UnknownError":
        return {
          status: "error",
          message: GenericErrors.UNKNOWN_ERROR,
        };
      default:
        return {
          status: "error",
          message: GenericErrors.SERVER_ERROR,
        };
    }
  } catch (error) {
    console.log("UnCatch error", error);
    return { status: "error", message: GenericErrors.SERVER_ERROR };
  }
}
