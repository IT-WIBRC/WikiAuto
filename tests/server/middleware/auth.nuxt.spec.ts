import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StatusCodes } from "http-status-codes";
import authMiddleware from "~/server/middleware/auth";
import type { MockH3EventComplete } from "~/tests/types/test-utils";
import { createMockEvent } from "~/tests/utils/api";
import { GenericErrors } from "~/shared/types/enums/GenericErrors";

const { mockUseServerUser } = vi.hoisted(() => {
  return {
    mockUseServerUser: vi.fn(),
  };
});

vi.mock("~/shared/utils/api-client", () => ({
  useServerUser: mockUseServerUser,
}));

vi.mock("h3", async (importOriginal) => {
  const mod = await importOriginal<typeof import("h3")>();
  return {
    ...mod,
    defineEventHandler: vi.fn((handler) => handler),
  };
});

describe("Server Middleware: auth.ts", () => {
  let mockEvent: MockH3EventComplete;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEvent = createMockEvent({
      path: "/api/protected",
      method: "GET",
      statusCode: StatusCodes.CONTINUE,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should attach the user to event.context and not return a response if the user is authenticated", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
    };
    mockUseServerUser.mockResolvedValueOnce(mockUser);

    const result = await authMiddleware(mockEvent);

    expect(mockUseServerUser).toHaveBeenCalledWith(mockEvent);
    expect(mockEvent.context.auth.user).toEqual(mockUser);
    expect(result).toBeUndefined();
  });

  it("should return a 401 UNAUTHORIZED response if the user is not authenticated", async () => {
    mockUseServerUser.mockResolvedValueOnce(null);

    const result = await authMiddleware(mockEvent);

    expect(mockUseServerUser).toHaveBeenCalledWith(mockEvent);
    expect(mockEvent.node.res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    expect(result).toEqual({
      status: "error",
      code: GenericErrors.UNAUTHORIZED,
      hint: "Authentication required.",
    });
  });

  it("should return a 500 INTERNAL_SERVER_ERROR if fetching the user fails", async () => {
    mockUseServerUser.mockRejectedValueOnce(
      new Error("Database connection failed"),
    );

    const result = await authMiddleware(mockEvent);

    expect(mockUseServerUser).toHaveBeenCalledWith(mockEvent);
    expect(mockEvent.node.res.statusCode).toBe(
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
    expect(result).toEqual({
      status: "error",
      code: GenericErrors.SERVER_ERROR,
      hint: "An unexpected server error occurred.",
    });
  });
});
