import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StatusCodes } from "http-status-codes";
import { GenericErrors } from "~/shared/types/enums/GenericErrors";
import profilePatchHandler from "~/server/api/users/profile.patch";
import type { MockH3EventComplete } from "~/tests/types/test-utils";
import { createMockEvent } from "~/tests/utils/api";
import type {
  EditUserProfileDTO,
  GetUserProfileDTO,
} from "~/shared/types/api/server";
import type { DBUser } from "~/shared/types/data-access";

const { mockReadBody, mockUpdateProfileInformation, mockCreateAuthService } =
  vi.hoisted(() => {
    const mockReadBody = vi.fn();
    const mockUpdateProfileInformation = vi.fn();
    const mockCreateAuthService = vi.fn(async () => ({
      updateProfileInformation: mockUpdateProfileInformation,
    }));
    return {
      mockReadBody,
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
  const mockUser: DBUser = {
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
      method: "PATCH",
    });
    mockEvent.context.auth = { user: mockUser };
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return a 200 OK with the updated profile data on a successful full update", async () => {
    const mockPayload: GetUserProfileDTO = {
      username: "newusername",
      firstname: "New",
      lastname: "User",
    } as GetUserProfileDTO;
    const mockUpdatedProfile: GetUserProfileDTO = {
      email: "test@example.com",
      username: "newusername",
      firstname: "New",
      lastname: "User",
      created_at: "2023-01-01T00:00:00Z",
    };
    mockReadBody.mockResolvedValueOnce(mockPayload);
    mockUpdateProfileInformation.mockResolvedValueOnce({
      data: mockUpdatedProfile,
      error: null,
    });

    const response = await profilePatchHandler(mockEvent);

    expect(mockCreateAuthService).toHaveBeenCalledWith(mockEvent);
    expect(mockReadBody).toHaveBeenCalledWith(mockEvent);
    expect(mockUpdateProfileInformation).toHaveBeenCalledWith({
      user_id: mockUser.id,
      ...mockPayload,
    });
    expect(mockEvent.node.res.statusCode).toBe(StatusCodes.OK);
    expect(response).toEqual({
      status: "success",
      data: mockUpdatedProfile,
    });
  });

  it("should return a 200 OK on a successful partial update", async () => {
    const mockPartialPayload: Partial<EditUserProfileDTO> = {
      username: "partialupdate",
    };
    const mockUpdatedProfile: GetUserProfileDTO = {
      email: "test@example.com",
      username: "partialupdate",
      firstname: "Test",
      lastname: "User",
      created_at: "2023-01-01T00:00:00Z",
    };
    mockReadBody.mockResolvedValueOnce(mockPartialPayload);
    mockUpdateProfileInformation.mockResolvedValueOnce({
      data: mockUpdatedProfile,
      error: null,
    });

    const response = await profilePatchHandler(mockEvent);

    expect(mockUpdateProfileInformation).toHaveBeenCalledWith({
      user_id: mockUser.id,
      ...mockPartialPayload,
    });
    expect(mockEvent.node.res.statusCode).toBe(StatusCodes.OK);
    expect(response).toEqual({
      status: "success",
      data: mockUpdatedProfile,
    });
  });

  it("should return a 400 BAD_REQUEST error if the payload is invalid", async () => {
    mockReadBody.mockResolvedValueOnce(null);

    const response = await profilePatchHandler(mockEvent);

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
    const mockPayload: GetUserProfileDTO = {
      username: "newusername",
      firstname: "New",
      lastname: "User",
    } as GetUserProfileDTO;
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
    mockReadBody.mockRejectedValueOnce(new Error("Network Error"));

    const response = await profilePatchHandler(mockEvent);

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
