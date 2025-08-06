import {
  describe, it, expect, vi, beforeEach, afterEach
} from "vitest";
import {
  mockSupabaseClientInstance,
  mockSupabaseAuth,
  mockSupabaseQueryBuilder,
} from "~/vitest.setup";
import { authService } from "../auth.service";

const { mockUseDatabaseClient } = vi.hoisted(() => {
  const mockUseDatabaseClient = vi.fn();
  return { mockUseDatabaseClient };
});

vi.mock("../../utils/database-client", () => ({
  useDatabaseClient: mockUseDatabaseClient,
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseAuth.signInWithPassword.mockClear();
    mockSupabaseAuth.signOut.mockClear();
    mockSupabaseQueryBuilder.eq.mockClear();
    mockSupabaseQueryBuilder.select.mockClear();
    mockSupabaseQueryBuilder.update.mockClear();
    mockSupabaseQueryBuilder.single.mockClear();

    mockUseDatabaseClient.mockReturnValue(mockSupabaseClientInstance);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("loginUser", () => {
    it("should call signInWithPassword and return the login result", async () => {
      const mockEmail = "test@example.com";
      const mockPassword = "password123";
      const mockLoginResult = {
        data: {
          user: { id: "123" },
          session: {},
        },
        error: null,
      };

      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce(
        mockLoginResult,
      );

      const result = await authService.login(mockEmail, mockPassword);

      expect(mockUseDatabaseClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
        email: mockEmail,
        password: mockPassword,
      });
      expect(result).toEqual(mockLoginResult);
    });

    it("should handle error during loginUser", async () => {
      const mockEmail = "test@example.com";
      const mockPassword = "password123";
      const mockErrorResult = {
        data: {
          user: null,
          session: null,
        },
        error: {
          message: "Invalid credentials",
          status: 400,
        },
      };

      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce(
        mockErrorResult,
      );

      const result = await authService.login(mockEmail, mockPassword);

      expect(mockUseDatabaseClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockErrorResult);
      expect(result.error).not.toBeNull();
    });
  });

  describe("logoutUser", () => {
    it("should call signOut with global scope and return the authentication result", async () => {
      const mockAuthResult = {
        data: {
          user: null,
          session: null,
        },
        error: null,
      };

      mockSupabaseAuth.signOut.mockResolvedValueOnce(mockAuthResult);

      const result = await authService.logout();

      expect(mockUseDatabaseClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAuth.signOut).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAuth.signOut).toHaveBeenCalledWith({
        scope: "global",
      });
      expect(result).toEqual(mockAuthResult);
    });

    it("should handle error during logoutUser", async () => {
      const mockErrorResult = {
        data: {
          user: null,
          session: null,
        },
        error: {
          message: "Logout failed",
          status: 500,
        },
      };

      mockSupabaseAuth.signOut.mockResolvedValueOnce(mockErrorResult);

      const result = await authService.logout();

      expect(mockUseDatabaseClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAuth.signOut).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockErrorResult);
      expect(result.error).not.toBeNull();
    });
  });

  describe("fetchUserProfileById", () => {
    it("should fetch user profile by ID and return a single result", async () => {
      const mockUserId = "user-abc-123";
      const mockProfile = {
        email: "user@example.com",
        username: "testuser",
        lastname: "Doe",
        firstname: "John",
        created_at: "2023-01-01T00:00:00Z",
      };
      const mockQueryResult = {
        data: mockProfile,
        error: null,
      };

      mockSupabaseQueryBuilder.single.mockResolvedValueOnce(mockQueryResult);

      const result = await authService.fetchUserProfileById(mockUserId);

      expect(mockUseDatabaseClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClientInstance.from).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClientInstance.from).toHaveBeenCalledWith("profile");
      expect(mockSupabaseQueryBuilder.select).toHaveBeenCalledTimes(1);
      expect(mockSupabaseQueryBuilder.select).toHaveBeenCalledWith(
        "email, username, lastname, firstname, created_at",
      );
      expect(mockSupabaseQueryBuilder.eq).toHaveBeenCalledTimes(1);
      expect(mockSupabaseQueryBuilder.eq).toHaveBeenCalledWith(
        "user_id",
        mockUserId,
      );
      expect(mockSupabaseQueryBuilder.single).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockQueryResult);
    });

    it("should handle error during fetchUserProfileById", async () => {
      const mockUserId = "user-abc-123";
      const mockErrorResult = {
        data: null,
        error: {
          message: "Profile not found",
          status: 404,
        },
      };

      mockSupabaseQueryBuilder.single.mockResolvedValueOnce(mockErrorResult);

      const result = await authService.fetchUserProfileById(mockUserId);

      expect(mockUseDatabaseClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClientInstance.from).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClientInstance.from).toHaveBeenCalledWith("profile");
      expect(mockSupabaseQueryBuilder.select).toHaveBeenCalledTimes(1);
      expect(mockSupabaseQueryBuilder.eq).toHaveBeenCalledTimes(1);
      expect(mockSupabaseQueryBuilder.single).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockErrorResult);
      expect(result.error).not.toBeNull();
    });
  });

  describe("updateProfileInformation", () => {
    it("should update user profile information and return the updated profile", async () => {
      const mockProfileData = {
        user_id: "user-abc-123",
        username: "newusername",
        lastname: "NewDoe",
        firstname: "NewJohn",
      };
      const mockUpdatedProfile = {
        ...mockProfileData,
        email: "user@example.com",
        created_at: "2023-01-01T00:00:00Z",
      };
      const mockUpdateResult = {
        data: mockUpdatedProfile,
        error: null,
      };

      mockSupabaseQueryBuilder.single.mockResolvedValueOnce(mockUpdateResult);

      const result =
        await authService.updateProfileInformation(mockProfileData);

      expect(mockUseDatabaseClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClientInstance.from).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClientInstance.from).toHaveBeenCalledWith("profile");
      expect(mockSupabaseQueryBuilder.update).toHaveBeenCalledTimes(1);
      expect(mockSupabaseQueryBuilder.update).toHaveBeenCalledWith({
        username: mockProfileData.username,
        lastname: mockProfileData.lastname,
        firstname: mockProfileData.firstname,
      });
      expect(mockSupabaseQueryBuilder.eq).toHaveBeenCalledTimes(1);
      expect(mockSupabaseQueryBuilder.eq).toHaveBeenCalledWith(
        "user_id",
        mockProfileData.user_id,
      );
      expect(mockSupabaseQueryBuilder.select).toHaveBeenCalledTimes(1);
      expect(mockSupabaseQueryBuilder.select).toHaveBeenCalledWith();
      expect(mockSupabaseQueryBuilder.single).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUpdateResult);
    });

    it("should handle error during updateProfileInformation", async () => {
      const mockProfileData = {
        user_id: "user-abc-123",
        username: "newusername",
        lastname: "NewDoe",
        firstname: "NewJohn",
      };
      const mockErrorResult = {
        data: null,
        error: {
          message: "Failed to update profile",
          status: 500,
        },
      };

      mockSupabaseQueryBuilder.single.mockResolvedValueOnce(mockErrorResult);

      const result =
        await authService.updateProfileInformation(mockProfileData);

      expect(mockUseDatabaseClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClientInstance.from).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClientInstance.from).toHaveBeenCalledWith("profile");
      expect(mockSupabaseQueryBuilder.update).toHaveBeenCalledTimes(1);
      expect(mockSupabaseQueryBuilder.eq).toHaveBeenCalledTimes(1);
      expect(mockSupabaseQueryBuilder.select).toHaveBeenCalledTimes(1);
      expect(mockSupabaseQueryBuilder.single).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockErrorResult);
      expect(result.error).not.toBeNull();
    });
  });
});
