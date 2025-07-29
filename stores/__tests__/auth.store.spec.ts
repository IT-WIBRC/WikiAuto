import { beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "~/stores/auth.store";
import { GenericErrors } from "~/api";
import useTestUtils from "~/tests/utils";

const { fetchMock } = vi.hoisted(() => {
  const fetchMock = vi.fn();

  return { fetchMock };
});

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
      fetchMock.mockResolvedValueOnce(successLoginData);

      const credentials = {
        email: "myemail@gmail.com",
        password: "myHigh@1Password",
      };
      const responseOk = await authStore.login(
        credentials.email,
        credentials.password,
      );

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        body: credentials,
      });

      expect(responseOk).toEqual({
        status: "success",
        data: successLoginData.user,
      });
      expect(authStore.session).toEqual(successLoginData.session);
      authStore.$dispose();
    });

    it("should return an error if the credentials are malformed", async () => {
      const authStore = useAuthStore();
      expect(authStore.session).toBeNull();
      const credentialsFetchError = useTestUtils.getFetchError({
        message: "Credential",
        statusCode: "BAD_REQUEST",
        code: "BAD_REQUEST",
      });
      fetchMock.mockRejectedValueOnce(credentialsFetchError);

      const responseError = await authStore.login(
        "myemail@gmai",
        "myHigh@1Password",
      );
      expect(responseError).toEqual({
        status: "error",
        message: GenericErrors.BAD_REQUEST,
      });
      expect(authStore.session).toBeNull();

      authStore.$dispose();
    });

    it("should return the awaited error on native error(network)", async () => {
      const authStore = useAuthStore();
      expect(authStore.session).toBeNull();
      const networkError = useTestUtils.getFetchError({
        message: "Credential",
        statusCode: "NETWORK_AUTHENTICATION_REQUIRED",
        code: "NETWORK_ERROR",
      });
      fetchMock.mockRejectedValueOnce(networkError);

      const responseError = await authStore.login(
        "myemail@gmail.com",
        "myHigh@1Password",
      );
      expect(responseError).toEqual({
        status: "error",
        message: GenericErrors.NETWORK_ERROR,
      });
      expect(authStore.session).toBeNull();

      authStore.$dispose();
    });

    it("should return the awaited object on unmanaged error", async () => {
      const authStore = useAuthStore();
      expect(authStore.session).toBeNull();
      const networkError = useTestUtils.getFetchError({
        message: "Credential",
        statusCode: "SERVICE_UNAVAILABLE",
        code: "UNKNOWN_ERROR",
      });
      fetchMock.mockRejectedValueOnce(networkError);

      const responseError = await authStore.login(
        "myemail@gmail.com",
        "myHigh@1Password",
      );
      expect(responseError).toEqual({
        status: "error",
        message: GenericErrors.UNKNOWN_ERROR,
      });
      expect(authStore.session).toBeNull();

      authStore.$dispose();
    });
  });

  describe("Logout", () => {
    it("should return success when the logout is successful", async () => {
      const authStore = useAuthStore();
      const authStoreResetFnMock = vi.spyOn(authStore, "$reset");

      fetchMock.mockResolvedValueOnce({
        message: "Logout successful",
      });

      const responseOk = await authStore.logout();
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
      });

      expect(responseOk).toEqual({
        status: "success",
        data: undefined,
      });
      expect(authStore.session).toBeNull();
      expect(authStoreResetFnMock).toHaveBeenCalledOnce();

      authStore.$dispose();
    });

    it("should return the awaited error message when the logout failed", async () => {
      const authStore = useAuthStore();

      const serverError = useTestUtils.getFetchError({
        message: "Credential",
        statusCode: "INTERNAL_SERVER_ERROR",
        code: "SERVER_ERROR",
      });
      fetchMock.mockRejectedValueOnce(serverError);

      const responseOk = await authStore.logout();
      expect(responseOk).toEqual({
        status: "error",
        message: GenericErrors.SERVER_ERROR,
      });
      authStore.$dispose();
    });

    it("should return the awaited error message when the logout failed due to a timeout", async () => {
      const authStore = useAuthStore();

      const timeOutError = useTestUtils.getFetchError({
        message: "Credential",
        statusCode: "REQUEST_TIMEOUT",
        code: "TIMEOUT",
      });
      fetchMock.mockRejectedValueOnce(timeOutError);

      const responseOk = await authStore.logout();
      expect(responseOk).toEqual({
        status: "error",
        message: GenericErrors.TIMEOUT,
      });
      authStore.$dispose();
    });
  });
});
