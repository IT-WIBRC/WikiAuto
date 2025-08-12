import type { H3Event } from "h3";
import { defineEventHandler } from "h3";
import { createAuthService } from "../../services/auth.service";
import { StatusCodes } from "http-status-codes";
import { GenericErrors } from "~/shared/types/enums/GenericErrors";
import type {
  ResponseOnError,
  ResponseOnSuccess,
} from "~/shared/types/api/common";
import type { LogoutResponse } from "~/shared/types/api/server";

async function handleLogout(event: H3Event): Promise<LogoutResponse> {
  try {
    const authService = await createAuthService(event);
    const { error } = await authService.logout();

    if (error) {
      let errorResponse: ResponseOnError;
      if (
        error.message.includes("Invalid JWT") ||
        error.message.includes("expired token")
      ) {
        event.node.res.statusCode = StatusCodes.UNAUTHORIZED;
        errorResponse = {
          status: "error",
          code: GenericErrors.UNAUTHORIZED,
          hint: "Your session has expired. Please log in again.",
        };
      } else {
        event.node.res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        errorResponse = {
          status: "error",
          code: GenericErrors.SERVER_ERROR,
          hint: error.message || "An unexpected error occurred during logout.",
        };
      }
      return errorResponse;
    }

    event.node.res.statusCode = StatusCodes.OK;
    const successResponse: ResponseOnSuccess = {
      status: "success",
    };
    return successResponse;
  } catch (_error: unknown) {
    event.node.res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    const errorResponse: ResponseOnError = {
      status: "error",
      code: GenericErrors.SERVER_ERROR,
      hint: "An unexpected server error occurred.",
    };
    console.warn(_error);
    return errorResponse;
  }
}

export default defineEventHandler(async (event) => {
  return handleLogout(event);
});
