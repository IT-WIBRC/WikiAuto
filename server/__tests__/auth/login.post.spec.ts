import {
  describe, it, expect, vi, beforeEach, afterEach, type MockedFunction,
} from "vitest";
import { StatusCodes } from "http-status-codes";
import { GenericErrors } from "~/shared/types/enums/GenericErrors";
import loginPostHandler from "~/server/api/auth/login.post";
import { authService } from "~/server/services/auth.service";
import type { LoginResponse } from "~/shared/types/api/server";
import type {
  DBUser, DBSession, PasswordAuthenticationResult
} from "~/shared/types/data-access";
import { readBody } from "h3";
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
    login: vi.fn(),
  },
}));

type AuthServiceLoginResult = PasswordAuthenticationResult;

describe("POST /api/auth/login", () => {
  let mockEvent: MockH3EventComplete;
  let mockReadBody: MockedFunction<typeof readBody>;
  let mockAuthLogin: MockedFunction<typeof authService.login>;

  const mockUser: DBUser = {
    id: "user123",
    email: "test@example.com",
    aud: "",
    app_metadata: {},
    user_metadata: {},
    created_at: "",
  };

  const mockSession: DBSession = {
    access_token: "token",
    token_type: "Bearer",
    expires_in: 3600,
    expires_at: 123,
    refresh_token: "",
    user: mockUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockReadBody = vi.mocked(readBody);
    mockAuthLogin = vi.mocked(authService.login);

    mockEvent = createMockEvent({
      path: "/api/auth/login",
      statusCode: StatusCodes.OK,
      method: "POST",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const callHandler = async (
    readBodyPayload: { email?: string; password?: string },
    authServiceLoginResult: AuthServiceLoginResult
  ): Promise<LoginResponse> => {
    mockReadBody.mockResolvedValueOnce(readBodyPayload);
    mockAuthLogin.mockResolvedValueOnce(authServiceLoginResult);
    return await loginPostHandler(mockEvent);
  };

  it("should return 200 OK and user/session on successful login",
    async () => {
      const response = await callHandler(
        {
          email: "test@example.com",
          password: "password123",
        },
        {
          data: {
            user: mockUser,
            session: mockSession,
          },
          error: null,
        }
      );

      expect(mockReadBody).toHaveBeenCalledTimes(1);
      expect(mockAuthLogin).toHaveBeenCalledTimes(1);
      expect(mockAuthLogin).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(mockEvent.node.res.statusCode).toBe(StatusCodes.OK);
      expect(response).toEqual({
        status: "success",
        data: {
          user: mockUser,
          session: mockSession
        },
      });
    });

  it("should return 400 BAD_REQUEST if email or password is missing",
    async () => {
      const response = await callHandler(
        { email: "test@example.com" },
        {
          data: {
            user: null,
            session: null,
          },
          error: {
            message: "Email/password required",
            name: "",
            status: 0,
            __isAuthError: true
          }
        }
      );

      expect(mockReadBody).toHaveBeenCalledTimes(1);
      expect(mockAuthLogin).not.toHaveBeenCalled();
      expect(mockEvent.node.res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(response).toEqual({
        status: "error",
        code: GenericErrors.BAD_REQUEST,
        hint: "Email and password are required.",
      });
    });

  it("should return 401 UNAUTHORIZED for invalid login",
    async () => {
      const response = await callHandler(
        {
          email: "wrong@example.com",
          password: "wrongpassword"
        },
        {
          data: {
            user: null,
            session: null,
          },
          error: {
            message: "Invalid login credentials",
            name: "",
            status: 0,
            __isAuthError: true
          }
        }
      );

      expect(mockReadBody).toHaveBeenCalledTimes(1);
      expect(mockAuthLogin).toHaveBeenCalledTimes(1);
      expect(mockEvent.node.res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(response).toEqual({
        status: "error",
        code: GenericErrors.UNAUTHORIZED,
        hint: "Invalid email or password.",
      });
    });

  it("should return 401 UNAUTHORIZED for unconfirmed email",
    async () => {
      const response = await callHandler(
        {
          email: "unconfirmed@example.com",
          password: "password123"
        },
        {
          data: {
            user: null,
            session: null,
          },
          error: {
            message: "Email not confirmed",
            name: "",
            status: 0,
            __isAuthError: true
          }
        }
      );

      expect(mockReadBody).toHaveBeenCalledTimes(1);
      expect(mockAuthLogin).toHaveBeenCalledTimes(1);
      expect(mockEvent.node.res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(response).toEqual({
        status: "error",
        code: GenericErrors.EMAIL_NOT_VERIFIED,
        hint: "Please confirm your email address to log in.",
      });
    });

  it("should return 500 INTERNAL_SERVER_ERROR for a generic auth error",
    async () => {
      const response = await callHandler(
        {
          email: "test@example.com",
          password: "password123"
        },
        {
          data: {
            user: null,
            session: null,
          },
          error: {
            message: "Something went wrong",
            name: "",
            status: 0,
            __isAuthError: true
          }
        }
      );

      expect(mockReadBody).toHaveBeenCalledTimes(1);
      expect(mockAuthLogin).toHaveBeenCalledTimes(1);
      expect(mockEvent.node.res.statusCode)
        .toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response).toEqual({
        status: "error",
        code: GenericErrors.SERVER_ERROR,
        hint: "Something went wrong",
      });
    });

  it("should return 500 INTERNAL_SERVER_ERROR when data is null",
    async () => {
      const response = await callHandler(
        {
          email: "test@example.com",
          password: "password123"
        },
        {
          data: {
            user: null,
            session: null,
          },
          error: {
            name: "",
            status: 0,
            message: "",
            __isAuthError: true
          }
        }
      );

      expect(mockReadBody).toHaveBeenCalledTimes(1);
      expect(mockAuthLogin).toHaveBeenCalledTimes(1);
      expect(mockEvent.node.res.statusCode)
        .toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response).toEqual({
        status: "error",
        code: GenericErrors.SERVER_ERROR,
        hint: "An unexpected error occurred during login.",
      });
    });
});
