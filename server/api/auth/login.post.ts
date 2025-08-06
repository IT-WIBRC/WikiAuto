import type { H3Event } from "h3";
import { defineEventHandler, readBody } from "h3";
import { authService } from "../../services/auth.service";
import { StatusCodes } from "http-status-codes";
import { GenericErrors } from "~/shared/types/enums/GenericErrors";
import type {
  ResponseOnError,
  ResponseOnSuccess,
} from "~/shared/types/api/common";
import type { LoginPayloadData, LoginResponse } from "~/shared/types/api/server";

async function handleLogin(
  event: H3Event,
  email?: string,
  password?: string
): Promise<LoginResponse> {
  if (!email || !password) {
    event.node.res.statusCode = StatusCodes.BAD_REQUEST;
    const errorResponse: ResponseOnError = {
      status: "error",
      code: GenericErrors.BAD_REQUEST,
      hint: "Email and password are required.",
    };
    return errorResponse;
  }

  const { data, error } = await authService.login(email, password);

  if (error) {
    let errorResponse: ResponseOnError;
    if (error.message.includes("Invalid login credentials")) {
      event.node.res.statusCode = StatusCodes.UNAUTHORIZED;
      errorResponse = {
        status: "error",
        code: GenericErrors.UNAUTHORIZED,
        hint: "Invalid email or password.",
      };
    } else if (error.message.includes("Email not confirmed")) {
      event.node.res.statusCode = StatusCodes.UNAUTHORIZED;
      errorResponse = {
        status: "error",
        code: GenericErrors.EMAIL_NOT_VERIFIED,
        hint: "Please confirm your email address to log in.",
      };
    } else {
      event.node.res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      errorResponse = {
        status: "error",
        code: GenericErrors.SERVER_ERROR,
        hint:
          error.message || "An unexpected error occurred during login.",
      };
    }
    return errorResponse;
  }

  if (!data) {
    event.node.res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    return {
      status: "error",
      code: GenericErrors.SERVER_ERROR,
      hint: "Login data was unexpectedly null.",
    };
  }

  const successResponse: ResponseOnSuccess<LoginPayloadData> = {
    status: "success",
    data: {
      user: data.user,
      session: data.session,
    },
  };
  event.node.res.statusCode = StatusCodes.OK;
  return successResponse;
}

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);
  return handleLogin(event, email, password);
});
