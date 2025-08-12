import type { H3Event } from "h3";
import { defineEventHandler, readBody } from "h3";
import { StatusCodes } from "http-status-codes";
import { GenericErrors } from "~/shared/types/enums/GenericErrors";
import type {
  ResponseOnError,
  ResponseOnSuccess,
} from "~/shared/types/api/common";
import { createAuthService } from "~/server/services/auth.service";
import type {
  EditUserProfileDTO,
  EditUserProfileResponse,
  GetUserProfileDTO,
} from "~/shared/types/api/server";

async function handleProfileUpdate(
  event: H3Event,
): Promise<EditUserProfileResponse> {
  try {
    const authService = await createAuthService(event);
    const user = event.context.auth.user;

    const body = await readBody<EditUserProfileDTO>(event);

    if (!body || typeof body !== "object") {
      event.node.res.statusCode = StatusCodes.BAD_REQUEST;
      const errorResponse: ResponseOnError = {
        status: "error",
        code: GenericErrors.BAD_REQUEST,
        hint: "Invalid request payload.",
      };
      return errorResponse;
    }

    const payloadForService = {
      user_id: user.id,
      username: body.username,
      firstname: body.firstname,
      lastname: body.lastname,
    };

    const { data, error } =
      await authService.updateProfileInformation(payloadForService);

    if (error) {
      event.node.res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      const errorResponse: ResponseOnError = {
        status: "error",
        code: GenericErrors.SERVER_ERROR,
        hint:
          error.message ||
          "An unexpected error occurred while updating the profile.",
      };
      return errorResponse;
    }

    if (!data) {
      event.node.res.statusCode = StatusCodes.NOT_FOUND;
      const errorResponse: ResponseOnError = {
        status: "error",
        code: GenericErrors.NOT_FOUND,
        hint: "User profile not found after update. This is unexpected.",
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
    console.error("Profile PATCH handler error:", error);
    return errorResponse;
  }
}

export default defineEventHandler(async (event) => {
  return handleProfileUpdate(event);
});
