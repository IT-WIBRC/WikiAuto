import { StatusCodes } from "http-status-codes";
import type { ResponseOnError } from "~/shared/types/api/common";
import { GenericErrors } from "~/shared/types/enums/GenericErrors";
import { useServerUser } from "~/shared/utils/api-client";
import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const user = await useServerUser(event);

    if (!user) {
      event.node.res.statusCode = StatusCodes.UNAUTHORIZED;
      const errorResponse: ResponseOnError = {
        status: "error",
        code: GenericErrors.UNAUTHORIZED,
        hint: "Authentication required.",
      };
      return errorResponse;
    }
    event.context.auth = { user };
  } catch (error: unknown) {
    event.node.res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    const serverErrorResponse: ResponseOnError = {
      status: "error",
      code: GenericErrors.SERVER_ERROR,
      hint: "An unexpected server error occurred.",
    };
    console.error(error);
    return serverErrorResponse;
  }
});
