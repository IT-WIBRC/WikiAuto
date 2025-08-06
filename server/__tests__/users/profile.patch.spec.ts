import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StatusCodes } from "http-status-codes";
import { GenericErrors } from "~/shared/types/enums/GenericErrors";
import profilePatchHandler from "~/server/api/users/profile.patch";
import type { MockH3EventComplete } from "~/tests/types/test-utils";
import { createMockEvent } from "~/tests/utils/api";
import type { EditUserProfileDTO } from "~/shared/types/api/server";
import type { UserProfileData } from "~/shared/types/data-access";

const { mockReadBody } = vi.hoisted(() => {
  const mockReadBody = vi.fn();
  return { mockReadBody };
});

const { mockGetUser, mockUpdateProfileInformation, mockCreateAuthService } =
  vi.hoisted(() => {
    const mockGetUser = vi.fn();
    const mockUpdateProfileInformation = vi.fn();
    const mockCreateAuthService = vi.fn(() => ({
      getUser: mockGetUser,
      updateProfileInformation: mockUpdateProfileInformation,
    }));
    return {
      mockGetUser,
      mockUpdateProfileInformation,
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
    readBody: mockReadBody,
  };
});

describe("PATCH /api/profile", () => {
  let mockEvent: MockH3EventComplete;
  const mockUserId = "user-123";

  beforeEach(() => {
    vi.clearAllMocks();
    mockEvent = createMockEvent({
      path: "/api/profile",
      statusCode: StatusCodes.OK,
      method: "PATCH",
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUserId } },
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return a 200 OK with the updated profile data on a successful full update", async () => {
    const mockPayload: EditUserProfileDTO = {
      username: "newusername",
      firstname: "New",
      lastname: "User",
      user_id: "user-123",
      created_at: "2023-01-01T00:00:00Z",
    };
    const mockUpdatedProfile: UserProfileData = {
      ...mockPayload,
      email: "test@example.com",
    } as UserProfileData;
    mockReadBody.mockResolvedValueOnce(mockPayload);
    mockUpdateProfileInformation.mockResolvedValueOnce({
      data: mockUpdatedProfile,
      error: null,
    });

    const response = await profilePatchHandler(mockEvent);

    expect(mockCreateAuthService).toHaveBeenCalledWith(mockEvent);
    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockReadBody).toHaveBeenCalledWith(mockEvent);
    expect(mockUpdateProfileInformation).toHaveBeenCalledWith({
      user_id: mockUserId,
      username: mockPayload.username,
      firstname: mockPayload.firstname,
      lastname: mockPayload.lastname,
    });
    expect(mockEvent.node.res.statusCode).toBe(StatusCodes.OK);
    expect(response).toEqual({
      status: "success",
      data: mockUpdatedProfile,
    });
  });

  it("should return a 200 OK on a successful partial update", async () => {
    const mockPartialPayload = { username: "partialupdate" };
    const mockUpdatedProfile = {
      username: "partialupdate",
      firstname: "Original",
      lastname: "User",
      email: "test@example.com",
    };
    mockReadBody.mockResolvedValueOnce(mockPartialPayload);
    mockUpdateProfileInformation.mockResolvedValueOnce({
      data: mockUpdatedProfile,
      error: null,
    });

    const response = await profilePatchHandler(mockEvent);

    expect(mockUpdateProfileInformation).toHaveBeenCalledWith({
      user_id: mockUserId,
      username: mockPartialPayload.username,
      firstname: undefined,
      lastname: undefined,
    });
    expect(mockEvent.node.res.statusCode).toBe(StatusCodes.OK);
    expect(response).toEqual({
      status: "success",
      data: mockUpdatedProfile,
    });
  });

  it("should return a 401 UNAUTHORIZED error if no user is authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const response = await profilePatchHandler(mockEvent);

    expect(mockCreateAuthService).toHaveBeenCalledWith(mockEvent);
    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockUpdateProfileInformation).not.toHaveBeenCalled();
    expect(mockEvent.node.res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    expect(response).toEqual({
      status: "error",
      code: GenericErrors.UNAUTHORIZED,
      hint: "Authentication required.",
    });
  });

  it("should return a 400 BAD_REQUEST error if the payload is invalid", async () => {
    mockReadBody.mockResolvedValueOnce(null);

    const response = await profilePatchHandler(mockEvent);

    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockReadBody).toHaveBeenCalledWith(mockEvent);
    expect(mockUpdateProfileInformation).not.toHaveBeenCalled();
    expect(mockEvent.node.res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(response).toEqual({
      status: "error",
      code: GenericErrors.BAD_REQUEST,
      hint: "Invalid request payload.",
    });
  });

  it("should return a 500 INTERNAL_SERVER_ERROR if the profile update fails", async () => {
    const mockPayload = { username: "newusername" };
    const mockDbError = {
      message: "Database write failed",
      status: 500,
    };
    mockReadBody.mockResolvedValueOnce(mockPayload);
    mockUpdateProfileInformation.mockResolvedValueOnce({
      data: null,
      error: mockDbError,
    });

    const response = await profilePatchHandler(mockEvent);

    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockUpdateProfileInformation).toHaveBeenCalledTimes(1);
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
    mockGetUser.mockRejectedValueOnce(new Error("Network Error"));

    const response = await profilePatchHandler(mockEvent);

    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockUpdateProfileInformation).not.toHaveBeenCalled();
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
