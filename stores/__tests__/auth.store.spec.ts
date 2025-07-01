import { beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "~/stores/auth.store";
import { GenericErrors, authService } from "~/api";
import { AuthError, type AuthTokenResponsePassword } from "@supabase/auth-js";

describe("AuthStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
  });

  describe("Login", () => {
    it("should send the user data with status `success` when the login succeeds and set the user session", async () => {
      const authStore = useAuthStore();
      expect(authStore.session).toBeNull();
      const successLoginData = {
        user: {
          id: "b4ebcf93-7b09-4ee1-bbb3-0a67c1cb1748",
          app_metadata: {},
          user_metadata: {},
          aud: "fb2e796d-69f7-451a-8434-2307d1436d48",
        },
        session: {
          access_token: "access_token",
          refresh_token: "refresh_token",
          expires_in: "120950",
          user: {
            id: "b4ebcf93-7b09-4ee1-bbb3-0a67c1cb1748",
            app_metadata: {},
            user_metadata: {},
            aud: "fb2e796d-69f7-451a-8434-2307d1436d48",
          },
        },
      };
      vi.spyOn(authService, "login").mockImplementationOnce(() =>
        Promise.resolve({
          data: successLoginData,
          error: null,
        } as unknown as AuthTokenResponsePassword),
      );

      const responseOk = await authStore.login(
        "myemail@gmail.com",
        "myHigh@1Password",
      );
      expect(responseOk).toEqual({
        status: "success",
        data: successLoginData.user,
      });
      expect(authStore.session).toEqual(successLoginData.session);
      authStore.$dispose();
    });

    it("should return an error if login returns no user", async () => {
      const authStore = useAuthStore();
      expect(authStore.session).toBeNull();
      vi.spyOn(authService, "login").mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            user: null,
            session: null,
          },
          error: null,
          status: 200,
          statusText: "OK",
        } as unknown as AuthTokenResponsePassword),
      );

      const responseError = await authStore.login(
        "myemail@gmail.com",
        "myHigh@1Password",
      );
      expect(responseError).toEqual({
        status: "error",
        message: GenericErrors.SERVER_ERROR,
      });
      expect(authStore.session).toBeNull();

      authStore.$dispose();
    });

    it("should return an error if login returns error", async () => {
      const authStore = useAuthStore();
      expect(authStore.session).toBeNull();
      vi.spyOn(authService, "login").mockImplementationOnce(() =>
        Promise.resolve({
          data: null,
          error: new AuthError("invalid_credentials"),
          status: 400,
          statusText: "Bad Request",
        } as unknown as AuthTokenResponsePassword),
      );

      const responseError = await authStore.login(
        "myemail@gmail.com",
        "myHigh@1Password",
      );
      expect(responseError).toEqual({
        status: "error",
        message: GenericErrors.UNAUTHORIZED,
      });
      expect(authStore.session).toBeNull();

      authStore.$dispose();
    });
  });

  describe("Logout", () => {
    it("should return success when the logout is successful", async () => {
      const authStore = useAuthStore();
      const authStoreResetFnMock = vi.spyOn(authStore, "$reset");

      vi.spyOn(authService, "logout").mockImplementationOnce(() =>
        Promise.resolve({
          error: null,
          status: 200,
          statusText: "OK",
          data: {
            session: null,
            user: null,
          },
        }),
      );

      const responseOk = await authStore.logout();
      expect(responseOk).toEqual({
        status: "success",
        data: undefined,
      });
      expect(authStore.session).toBeNull();
      expect(authStoreResetFnMock).toHaveBeenCalledOnce();

      authStore.$dispose();
    });

    it("should return server error when the logout has failed", async () => {
      const authStore = useAuthStore();

      vi.spyOn(authService, "logout").mockImplementationOnce(() =>
        Promise.resolve({
          error: new AuthError("Session error"),
          status: 500,
          statusText: "Server Error",
          data: {
            session: null,
            user: null,
          },
        }),
      );

      const responseOk = await authStore.logout();
      expect(responseOk).toEqual({
        status: "error",
        message: GenericErrors.REQUEST_FAILED,
      });
      authStore.$dispose();
    });
  });
});
