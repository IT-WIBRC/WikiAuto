import {
  describe, it, expect, vi, beforeEach, afterEach, type MockedFunction,
} from "vitest";
import { StatusCodes } from "http-status-codes";
import { GenericErrors } from "~/shared/types/enums/GenericErrors";
import logoutPostHandler from "~/server/api/auth/logout.post";
import { authService } from "~/server/services/auth.service";
import type { LogoutResponse } from "~/shared/types/api/server";
import type { PasswordAuthenticationResult } from "~/shared/types/data-access";
import type { MockH3EventComplete } from "~/tests/types/test-utils";
import { createMockEvent } from "~/tests/utils/api";

vi.mock("h3", async (importOriginal) => {
  const mod = await importOriginal<typeof import("h3")>();
  const _mockReadBody = vi.fn();
  return {
    ...mod,
    readBody: _mockReadBody,
    defineEventHandler: vi.fn((handler) => handler),
  };
});

vi.mock("~/server/services/auth.service", () => ({
  authService: {
    logout: vi.fn(),
  },
}));

type AuthServiceLogoutResult = {
    error: PasswordAuthenticationResult["error"];
};

describe("POST /api/auth/logout", () => {
  let mockEvent: MockH3EventComplete;
  let mockAuthLogout: MockedFunction<typeof authService.logout>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthLogout = vi.mocked(authService.logout);

    mockEvent = createMockEvent({
      path: "/api/auth/logout",
      statusCode: StatusCodes.OK,
      method: "POST",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const callHandler = async (
    authServiceLogoutResult: AuthServiceLogoutResult,
  ): Promise<LogoutResponse> => {
    mockAuthLogout.mockResolvedValueOnce(authServiceLogoutResult);
    return await logoutPostHandler(mockEvent);
  };

  it("should return 200 OK on successful logout", async () => {
    const response = await callHandler({ error: null });

    expect(mockAuthLogout).toHaveBeenCalledTimes(1);
    expect(mockEvent.node.res.statusCode).toBe(StatusCodes.OK);
    expect(response).toEqual({
      status: "success",
    });
  });

  it("should return 401 UNAUTHORIZED for an expired or invalid token", async () => {
    const response = await callHandler({
      error: {
        message: "Invalid JWT",
        name: "",
        status: 0,
        __isAuthError: true,
      },
    });

    expect(mockAuthLogout).toHaveBeenCalledTimes(1);
    expect(mockEvent.node.res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    expect(response).toEqual({
      status: "error",
      code: GenericErrors.UNAUTHORIZED,
      hint: "Your session has expired. Please log in again.",
    });
  });

  it("should return 500 INTERNAL_SERVER_ERROR for a generic auth error", async () => {
    const response = await callHandler({
      error: {
        message: "Something went wrong",
        name: "",
        status: 0,
        __isAuthError: true,
      },
    });

    expect(mockAuthLogout).toHaveBeenCalledTimes(1);
    expect(mockEvent.node.res.statusCode).toBe(
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
    expect(response).toEqual({
      status: "error",
      code: GenericErrors.SERVER_ERROR,
      hint: "Something went wrong",
    });
  });

  it("should return 500 INTERNAL_SERVER_ERROR for an unexpected service exception", async () => {
    mockAuthLogout.mockRejectedValueOnce(new Error("Network Error"));

    const response = await logoutPostHandler(mockEvent);

    expect(mockAuthLogout).toHaveBeenCalledTimes(1);
    expect(mockEvent.node.res.statusCode).toBe(
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
    expect(response).toEqual({
      status: "error",
      code: GenericErrors.SERVER_ERROR,
      hint: "An unexpected server error occurred.",
    });
  });
});
