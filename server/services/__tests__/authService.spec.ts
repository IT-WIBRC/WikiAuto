import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  mockSupabaseClientInstance,
  mockSupabaseAuth,
  mockSupabaseQueryBuilder,
} from "~/vitest.setup";
import { createAuthService } from "../auth.service";
import type { H3Event } from "h3";

const { mockUseServerClient } = vi.hoisted(() => {
  const mockUseServerClient = vi.fn();
  return { mockUseServerClient };
});

vi.mock("~/shared/utils/api-client", () => ({
  useServerClient: mockUseServerClient,
}));

describe("createAuthService", () => {
  const mockEvent: H3Event = {
    req: {},
    node: { res: {} },
    context: {},
  } as unknown as H3Event;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseServerClient.mockReturnValue(mockSupabaseClientInstance);
    vi.spyOn(mockSupabaseClientInstance, "from").mockReturnValue(
      mockSupabaseQueryBuilder,
    );
    vi.spyOn(mockSupabaseQueryBuilder, "select").mockReturnValue(
      mockSupabaseQueryBuilder,
    );
    vi.spyOn(mockSupabaseQueryBuilder, "eq").mockReturnValue(
      mockSupabaseQueryBuilder,
    );
    vi.spyOn(mockSupabaseQueryBuilder, "update").mockReturnValue(
      mockSupabaseQueryBuilder,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create and return a service instance with all methods", async () => {
    const authService = await createAuthService(mockEvent);

    expect(authService).toBeDefined();
    expect(authService.logout).toBeInstanceOf(Function);
    expect(authService.getUser).toBeInstanceOf(Function);
    expect(authService.fetchUserProfileById).toBeInstanceOf(Function);
    expect(authService.updateProfileInformation).toBeInstanceOf(Function);
    expect(mockUseServerClient).toHaveBeenCalledWith(mockEvent);
  });

  describe("logout", () => {
    it("should call signOut with global scope and return the authentication result", async () => {
      const mockAuthResult = {
        data: { user: null },
        error: null,
      };
      mockSupabaseAuth.signOut.mockResolvedValueOnce(mockAuthResult);
      const authService = await createAuthService(mockEvent);

      const result = await authService.logout();

      expect(mockUseServerClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAuth.signOut).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAuth.signOut).toHaveBeenCalledWith({
        scope: "global",
      });
      expect(result).toEqual(mockAuthResult);
    });
  });

  describe("getUser", () => {
    it("should call getUser and return the user result", async () => {
      const mockUserData = { id: "user-123" };
      const mockUserResult = {
        data: { user: mockUserData },
        error: null,
      };
      mockSupabaseAuth.getUser.mockResolvedValueOnce(mockUserResult);
      const authService = await createAuthService(mockEvent);

      const result = await authService.getUser();

      expect(mockUseServerClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAuth.getUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserResult);
    });

    it("should return an error if the user retrieval fails", async () => {
      const mockErrorResult = {
        data: { user: null },
        error: { message: "Invalid user token" },
      };
      mockSupabaseAuth.getUser.mockResolvedValueOnce(mockErrorResult);
      const authService = await createAuthService(mockEvent);

      const result = await authService.getUser();

      expect(mockUseServerClient).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockErrorResult);
      expect(result.error).not.toBeNull();
    });
  });

  describe("fetchUserProfileById", () => {
    it("should fetch user profile by ID and return a single result", async () => {
      const mockUserId = "user-abc-123";
      const mockProfile = { email: "user@example.com" };
      const mockQueryResult = {
        data: mockProfile,
        error: null,
      };
      mockSupabaseQueryBuilder.single.mockResolvedValueOnce(mockQueryResult);
      const authService = await createAuthService(mockEvent);

      const result = await authService.fetchUserProfileById(mockUserId);

      expect(mockUseServerClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClientInstance.from).toHaveBeenCalledWith("profile");
      expect(mockSupabaseQueryBuilder.select).toHaveBeenCalledWith(
        "email, username, lastname, firstname, created_at",
      );
      expect(mockSupabaseQueryBuilder.eq).toHaveBeenCalledWith(
        "user_id",
        mockUserId,
      );
      expect(mockSupabaseQueryBuilder.single).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockQueryResult);
    });
  });

  describe("updateProfileInformation", () => {
    it("should update user profile information and return the updated profile", async () => {
      const mockProfileData = {
        user_id: "user-abc-123",
        username: "newuser",
        lastname: "NewDoe",
        firstname: "NewJohn",
      };
      const mockUpdatedProfile = {
        ...mockProfileData,
        email: "user@example.com",
      };
      const mockUpdateResult = {
        data: mockUpdatedProfile,
        error: null,
      };
      mockSupabaseQueryBuilder.single.mockResolvedValueOnce(mockUpdateResult);
      const authService = await createAuthService(mockEvent);

      const result =
        await authService.updateProfileInformation(mockProfileData);

      expect(mockUseServerClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClientInstance.from).toHaveBeenCalledWith("profile");
      expect(mockSupabaseQueryBuilder.update).toHaveBeenCalledWith({
        username: mockProfileData.username,
        lastname: mockProfileData.lastname,
        firstname: mockProfileData.firstname,
      });
      expect(mockSupabaseQueryBuilder.eq).toHaveBeenCalledWith(
        "user_id",
        mockProfileData.user_id,
      );
      expect(mockSupabaseQueryBuilder.select).toHaveBeenCalledTimes(1);
      expect(mockSupabaseQueryBuilder.single).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUpdateResult);
    });
  });
});
