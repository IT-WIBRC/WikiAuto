import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StatusCodes } from "http-status-codes";
import { GenericErrors } from "~/shared/types/enums/GenericErrors";
import profileGetHandler from "~/server/api/users/profile.get";
import type { MockH3EventComplete } from "~/tests/types/test-utils";
import { createMockEvent } from "~/tests/utils/api";
import type { GetUserProfileDTO } from "~/shared/types/api/server";
import type { DBUser } from "~/shared/types/data-access";

const { mockFetchUserProfileById, mockCreateAuthService } = vi.hoisted(() => {
  const mockFetchUserProfileById = vi.fn();
  const mockCreateAuthService = vi.fn(() => ({
    fetchUserProfileById: mockFetchUserProfileById,
  }));
  return {
    mockFetchUserProfileById,
    mockCreateAuthService,
  };
});

vi.mock("~/server/services/auth.service", () => ({
  createAuthService: mockCreateAuthService,
}));

vi.mock("h3", async (importOriginal) => {
  const mod = await importOriginal<typeof import("h3")>();
  return {
    ...mod,
    defineEventHandler: vi.fn((handler) => handler),
  };
});

describe("GET /api/profile", () => {
  let mockEvent: MockH3EventComplete;
  const mockAuthenticatedUser: DBUser = {
    id: "user-123",
    email: "test@example.com",
    user_metadata: {
      username: "testuser",
      firstname: "Test",
      lastname: "User",
    },
    created_at: "2023-01-01T00:00:00Z",
    app_metadata: {},
    aud: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEvent = createMockEvent({
      path: "/api/profile",
      statusCode: StatusCodes.OK,
      method: "GET",
    });
    mockEvent.context.auth = { user: mockAuthenticatedUser };
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return a 200 OK with user profile data on success", async () => {
    const mockProfile: GetUserProfileDTO = {
      email: "test@example.com",
      username: "testuser",
      firstname: "Test",
      lastname: "User",
      created_at: "2023-01-01T00:00:00Z",
    };
    mockFetchUserProfileById.mockResolvedValueOnce({
      data: mockProfile,
      error: null,
    });

    const response = await profileGetHandler(mockEvent);

    expect(mockCreateAuthService).toHaveBeenCalledWith(mockEvent);
    expect(mockFetchUserProfileById).toHaveBeenCalledWith(
      mockAuthenticatedUser.id,
    );
    expect(mockEvent.node.res.statusCode).toBe(StatusCodes.OK);
    expect(response).toEqual({
      status: "success",
      data: mockProfile,
    });
  });

  it("should return a 404 NOT_FOUND error if the profile does not exist", async () => {
    mockFetchUserProfileById.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const response = await profileGetHandler(mockEvent);

    expect(mockCreateAuthService).toHaveBeenCalledWith(mockEvent);
    expect(mockFetchUserProfileById).toHaveBeenCalledWith(
      mockAuthenticatedUser.id,
    );
    expect(mockEvent.node.res.statusCode).toBe(StatusCodes.NOT_FOUND);
    expect(response).toEqual({
      status: "error",
      code: GenericErrors.NOT_FOUND,
      hint: "User profile not found.",
    });
  });

  it("should return a 500 INTERNAL_SERVER_ERROR if fetching the profile fails", async () => {
    const mockDbError = {
      message: "Database connection failed",
      status: 500,
    };
    mockFetchUserProfileById.mockResolvedValueOnce({
      data: null,
      error: mockDbError,
    });

    const response = await profileGetHandler(mockEvent);

    expect(mockCreateAuthService).toHaveBeenCalledWith(mockEvent);
    expect(mockFetchUserProfileById).toHaveBeenCalledWith(
      mockAuthenticatedUser.id,
    );
    expect(mockEvent.node.res.statusCode).toBe(
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
    expect(response).toEqual({
      status: "error",
      code: GenericErrors.SERVER_ERROR,
      hint: mockDbError.message,
    });
  });

  it("should return a 500 INTERNAL_SERVER_ERROR for an unexpected exception", async () => {
    mockCreateAuthService.mockImplementationOnce(() => {
      throw new Error("Service initialization failed");
    });

    const response = await profileGetHandler(mockEvent);

    expect(mockCreateAuthService).toHaveBeenCalledWith(mockEvent);
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
