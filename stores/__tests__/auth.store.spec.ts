import { beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "~/stores/auth.store";
import useTestUtils from "~/tests/utils/ui";
import { GenericErrors } from "~/shared/types/enums/GenericErrors";
import type { DBSession } from "~/shared/types/data-access";

const { mockSignInWithPassword, fetchMock } = vi.hoisted(() => {
  const mockSignInWithPassword = vi.fn();
  const fetchMock = vi.fn();

  return {
    mockSignInWithPassword,
    fetchMock,
  };
});

vi.mock("~/shared/utils/api-client", () => ({
  useApiClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  })),
}));

vi.mock("ofetch", async () => {
  const originalModule = await vi.importActual("ofetch");
  return {
    ...originalModule,
    $fetch: fetchMock,
  };
});

describe("AuthStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("Login", () => {
    it("should send the user data with status `success` and set the session on success", async () => {
      const authStore = useAuthStore();
      const mockSuccessResponse = {
        data: {
          user: { id: "user-123" },
          session: { access_token: "mock-token" },
        },
        error: null,
      };

      mockSignInWithPassword.mockResolvedValueOnce(mockSuccessResponse);

      const response = await authStore.login("myemail@gmail.com", "password");

      expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
      useTestUtils.expectApiSuccess(response, mockSuccessResponse.data.user);
      expect(authStore.session).toEqual(mockSuccessResponse.data.session);
    });

    it("should return a VALIDATION_ERROR on Supabase authentication failure", async () => {
      const authStore = useAuthStore();
      const mockError = {
        data: {
          user: null,
          session: null,
        },
        error: {
          message: "Invalid login credentials",
          status: 400,
        },
      };

      mockSignInWithPassword.mockResolvedValueOnce(mockError);

      const response = await authStore.login("invalid@email.com", "wrongpass");

      expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
      useTestUtils.expectApiError(
        response,
        GenericErrors.VALIDATION_ERROR,
        "Invalid login credentials",
      );
      expect(authStore.session).toBeNull();
    });

    it("should return a SERVER_ERROR on unmanaged error", async () => {
      const authStore = useAuthStore();
      const mockMalformedResponse = {
        data: {
          user: null,
          session: {},
        },
        error: null,
      };

      mockSignInWithPassword.mockResolvedValueOnce(mockMalformedResponse);

      const response = await authStore.login("myemail@gmail.com", "password");

      expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
      useTestUtils.expectApiError(
        response,
        GenericErrors.SERVER_ERROR,
        "An unexpected error occurred. Please try again.",
      );
      expect(authStore.session).toBeNull();
    });

    it("should return a SERVER_ERROR on a native exception", async () => {
      const authStore = useAuthStore();
      const mockNativeError = new Error("Network error occurred.");
      mockSignInWithPassword.mockRejectedValueOnce(mockNativeError);

      const response = await authStore.login("myemail@gmail.com", "password");

      expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
      useTestUtils.expectApiError(
        response,
        GenericErrors.SERVER_ERROR,
        "Network error occurred.",
      );
      expect(authStore.session).toBeNull();
    });
  });

  describe("Logout", () => {
    it("should call the logout API and reset the store on success", async () => {
      const authStore = useAuthStore();
      const authStoreResetFnMock = vi.spyOn(authStore, "$reset");
      fetchMock.mockResolvedValueOnce({ status: "success" });

      const response = await authStore.logout();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
        timeout: 3000,
      });
      useTestUtils.expectApiSuccess(response, undefined);
      expect(authStoreResetFnMock).toHaveBeenCalledOnce();
      expect(authStore.session).toBeNull();
    });

    it("should return an error and not reset the store on logout failure", async () => {
      const authStore = useAuthStore();
      const serverError = useTestUtils.getFetchError({
        message: "Server failed to log out",
        statusCode: "INTERNAL_SERVER_ERROR",
        code: "SERVER_ERROR",
      });
      fetchMock.mockRejectedValueOnce(serverError);
      authStore.setSession({ access_token: "active-token" } as DBSession);
      const authStoreResetFnMock = vi.spyOn(authStore, "$reset");

      const response = await authStore.logout();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      useTestUtils.expectApiError(
        response,
        "SERVER_ERROR",
        "An unexpected error occurred.",
      );
      expect(authStoreResetFnMock).not.toHaveBeenCalled();
      expect(authStore.session).not.toBeNull();
      expect(authStore.session).toEqual({ access_token: "active-token" });
    });
  });
});
