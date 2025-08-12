import { beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useUserStore } from "~/stores/user.store";
import { GenericErrors } from "~/shared/types/enums/GenericErrors";
import type {
  GetUserProfileDTO,
  GetUserProfileResponse,
  EditUserProfileDTO,
  EditUserProfileResponse,
} from "~/shared/types/api/server";

const { mockFetch } = vi.hoisted(() => {
  const mockFetch = vi.fn();
  return { mockFetch };
});

const { mockWrapServiceCall, mockHandleSingleItemResponse } = vi.hoisted(() => {
  const mockWrapServiceCall = vi.fn();
  const mockHandleSingleItemResponse = vi.fn();
  return {
    mockWrapServiceCall,
    mockHandleSingleItemResponse,
  };
});

vi.mock("ofetch", () => ({
  $fetch: mockFetch,
}));

vi.mock("~/api", () => ({
  handleSingleItemResponse: mockHandleSingleItemResponse,
  wrapServiceCall: mockWrapServiceCall,
  Maybe: {
    fromNullable: vi.fn((value) => ({
      fold: vi.fn((onEmpty, onSome) => (value ? onSome(value) : onEmpty())),
    })),
  },
  Either: {
    fromSuccess: vi.fn((value) => ({
      isRight: true,
      fold: vi.fn((_, right) => right(value)),
    })),
    fromError: vi.fn((value) => ({
      isLeft: true,
      fold: vi.fn((left) => left(value)),
    })),
  },
}));

describe("User Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("State and Getters", () => {
    it("should have the correct initial state", () => {
      const store = useUserStore();
      expect(store.currentUser).toEqual({});
      expect(store.hasAlreadyFetchUserProfile).toBe(false);
    });

    it("isAuthenticated should be false when user is not set", () => {
      const store = useUserStore();
      expect(store.isAuthenticated).toBe(false);
    });

    it("isAuthenticated should be true when user is set", () => {
      const store = useUserStore();
      store.currentUser.id = "user-123";
      expect(store.isAuthenticated).toBe(true);
    });
  });

  describe("Actions", () => {
    it("setCurrentUserIdAndEmail should set user id and email", () => {
      const store = useUserStore();
      const userId = "user-abc";
      const email = "test@example.com";
      store.setCurrentUserIdAndEmail(userId, email);

      expect(store.currentUser.id).toBe(userId);
      expect(store.currentUser.email).toBe(email);
    });

    it("setCurrentOtherUserInfo should set other user information", () => {
      const store = useUserStore();
      const userInfos = {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        created_at: "2023-01-01",
      };
      store.setCurrentOtherUserInfo(userInfos);

      expect(store.currentUser.firstname).toBe("John");
      expect(store.currentUser.lastname).toBe("Doe");
      expect(store.currentUser.username).toBe("johndoe");
      expect(store.currentUser.created_at).toBe("2023-01-01");
    });

    it("setCurrentOtherUserInfo should handle undefined values gracefully", () => {
      const store = useUserStore();
      const userInfos = {
        firstname: "Jane",
      };
      store.setCurrentOtherUserInfo(userInfos);

      expect(store.currentUser.firstname).toBe("Jane");
      expect(store.currentUser.lastname).toBe("");
      expect(store.currentUser.username).toBe("");
    });

    it("markProfileAsFetched should set hasAlreadyFetchUserProfile to true", () => {
      const store = useUserStore();
      store.markProfileAsFetched();
      expect(store.hasAlreadyFetchUserProfile).toBe(true);
    });

    describe("getProfile", () => {
      it("should return a BAD_REQUEST error if currentUser.id is not set", async () => {
        const store = useUserStore();
        store.currentUser.id = "";
        const response = await store.getProfile();

        expect(mockFetch).not.toHaveBeenCalled();
        expect(response).toEqual({
          status: "error",
          code: GenericErrors.BAD_REQUEST,
        });
      });

      it("should fetch the profile and update state on success", async () => {
        const store = useUserStore();
        const mockUserProfile: GetUserProfileDTO = {
          firstname: "Test",
          lastname: "User",
          username: "testuser",
        } as GetUserProfileDTO;
        const mockApiResponse: GetUserProfileResponse = {
          status: "success",
          data: mockUserProfile,
        };
        store.setCurrentUserIdAndEmail("user-123", "test@example.com");

        mockHandleSingleItemResponse.mockImplementationOnce((_, handlers) => {
          return handlers.onFound(mockUserProfile);
        });

        const response = await store.getProfile();

        expect(mockFetch).toHaveBeenCalledOnce();
        expect(mockFetch).toHaveBeenCalledWith("/api/users/profile", {
          method: "GET",
        });
        expect(store.currentUser.firstname).toBe("Test");
        expect(store.currentUser.username).toBe("testuser");
        expect(store.hasAlreadyFetchUserProfile).toBe(true);
        expect(response).toEqual(mockApiResponse);
      });

      it("should return an error and not update state on fetch failure", async () => {
        const store = useUserStore();
        store.setCurrentUserIdAndEmail("user-123", "test@example.com");
        const mockErrorResponse = {
          status: "error",
          code: GenericErrors.NOT_FOUND,
          hint: "Profile not found",
        };

        mockHandleSingleItemResponse.mockImplementation((_, handlers) => {
          return handlers.onError(mockErrorResponse);
        });

        const response = await store.getProfile();

        expect(mockFetch).toHaveBeenCalledWith("/api/users/profile", {
          method: "GET",
        });
        expect(store.hasAlreadyFetchUserProfile).toBe(false);
        expect(store.currentUser.username).toBeUndefined();
        expect(response).toEqual(mockErrorResponse);
      });
    });

    describe("updateInfo", () => {
      it("should update user info and state on success", async () => {
        const store = useUserStore();
        const mockPayload: EditUserProfileDTO = {
          username: "updated_user",
          user_id: "user-123",
        };
        const mockUpdatedUser: GetUserProfileDTO = {
          ...mockPayload,
          firstname: "Original",
          email: "",
        } as GetUserProfileDTO;
        const mockResponse: EditUserProfileResponse<undefined> = {
          status: "success",
        };
        store.setCurrentUserIdAndEmail("user-123", "test@example.com");
        store.setCurrentOtherUserInfo({ firstname: "Original" });

        mockHandleSingleItemResponse.mockImplementation((_, handlers) => {
          return handlers.onFound(mockUpdatedUser);
        });

        const response = await store.updateInfo(mockPayload);

        expect(mockFetch).toHaveBeenCalledWith("/api/users/profile", {
          method: "PATCH",
          body: mockPayload,
        });
        expect(store.currentUser.username).toBe("updated_user");
        expect(store.currentUser.firstname).toBe("Original");
        expect(response).toEqual(mockResponse);
      });

      it("should return an error and not update state on failure", async () => {
        const store = useUserStore();
        const mockPayload: EditUserProfileDTO = {
          username: "updated_user",
          user_id: "user-123",
        };
        const mockErrorResponse = {
          status: "error",
          code: GenericErrors.SERVER_ERROR,
          hint: "Update failed",
        };
        store.setCurrentUserIdAndEmail("user-123", "test@example.com");

        mockHandleSingleItemResponse.mockImplementation((_, handlers) => {
          return handlers.onError(mockErrorResponse);
        });

        const response = await store.updateInfo(mockPayload);

        expect(mockFetch).toHaveBeenCalledWith("/api/users/profile", {
          method: "PATCH",
          body: mockPayload,
        });
        expect(store.currentUser.username).toBeUndefined();
        expect(response).toEqual(mockErrorResponse);
      });
    });
  });
});
