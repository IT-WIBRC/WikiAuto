import type { H3Event } from "h3";
import { defineEventHandler } from "h3";
import { StatusCodes } from "http-status-codes";
import { GenericErrors } from "~/shared/types/enums/GenericErrors";
import type {
  ResponseOnError,
  ResponseOnSuccess,
} from "~/shared/types/api/common";
import { createAuthService } from "~/server/services/auth.service";
import type {
  GetUserProfileDTO,
  GetUserProfileResponse,
} from "~/shared/types/api/server";

async function handleProfileGet(
  event: H3Event,
): Promise<GetUserProfileResponse> {
  try {
    const authService = createAuthService(event);

    const {
      data: { user },
    } = await authService.getUser();

    if (!user) {
      event.node.res.statusCode = StatusCodes.UNAUTHORIZED;
      const errorResponse: ResponseOnError = {
        status: "error",
        code: GenericErrors.UNAUTHORIZED,
        hint: "Authentication required.",
      };
      return errorResponse;
    }

    const { data, error } = await authService.fetchUserProfileById(user.id);

    if (error) {
      event.node.res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      const errorResponse: ResponseOnError = {
        status: "error",
        code: GenericErrors.SERVER_ERROR,
        hint:
          error.message ||
          "An unexpected error occurred while fetching the profile.",
      };
      return errorResponse;
    }

    if (!data) {
      event.node.res.statusCode = StatusCodes.NOT_FOUND;
      const errorResponse: ResponseOnError = {
        status: "error",
        code: GenericErrors.NOT_FOUND,
        hint: "User profile not found.",
      };
      return errorResponse;
    }

    event.node.res.statusCode = StatusCodes.OK;
    const successResponse: ResponseOnSuccess<GetUserProfileDTO> = {
      status: "success",
      data,
    };
    return successResponse;
  } catch (error: unknown) {
    event.node.res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    const errorResponse: ResponseOnError = {
      status: "error",
      code: GenericErrors.SERVER_ERROR,
      hint: "An unexpected server error occurred.",
    };
    console.error("Profile GET handler error:", error);
    return errorResponse;
  }
}

export default defineEventHandler(async (event) => {
  return handleProfileGet(event);
});
