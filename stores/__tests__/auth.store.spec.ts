import { beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "../auth.store";
import { authService } from "../../api/authService";
import { GenericErrors } from "../../api/types";

describe("AuthStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("Login", () => {
    it("should send the user data with status `success` when the login succeed ans set the user session", async () => {
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
        }),
      );

      const responseOk = await authStore.login(
        "myemail@gmail.com",
        "myHigh@1Password",
      );
      expect(responseOk.status).toBe("success");
      expect(authStore.session).toEqual(successLoginData.session);
      expect(responseOk.data).toEqual(successLoginData.user);
    });

    describe("On Error", () => {
      it("should return an error on bad request", async () => {
        const authStore = useAuthStore();
        expect(authStore.session).toBeNull();
        const errorLoginData = {
          data: {
            user: null,
            session: null,
          },
          error: {
            code: "invalid_credentials",
            status: 400,
          },
        };
        vi.spyOn(authService, "login").mockImplementationOnce(() =>
          Promise.resolve({
            ...errorLoginData,
          }),
        );

        const responseError = await authStore.login(
          "myemail@gmail.com",
          "myHigh@1Password",
        );
        expect(responseError.status).toBe("error");
        expect(authStore.session).toBeNull();
        expect(responseError.message).toBe(GenericErrors.BAD_REQUEST);
      });

      it("should return an error on bad unknown error", async () => {
        const authStore = useAuthStore();
        expect(authStore.session).toBeNull();
        const errorLoginData = {
          data: {
            user: null,
            session: null,
          },
          error: {
            code: "AuthError",
            status: 500,
          },
        };
        vi.spyOn(authService, "login").mockImplementationOnce(() =>
          Promise.resolve({
            ...errorLoginData,
          }),
        );

        const responseError = await authStore.login(
          "myemail@gmail.com",
          "myHigh@1Password",
        );
        expect(responseError.status).toBe("error");
        expect(authStore.session).toBeNull();
        expect(responseError.message).toBe(GenericErrors.UNKNOWN_ERROR);
      });
    });
  });
});
