import type { Session, User } from "@supabase/auth-js";
import { authService } from "~/api/authService";
import type { ApiResponseResult } from "~/api/types";
import { GenericErrors } from "~/api/types";

type AuthState = {
  session: Session | null;
};
export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    session: null,
  }),
  getters: {
    isLoggedIn(state): boolean {
      return !!state.session;
    },
  },
  actions: {
    async login(
      email: string,
      password: string,
    ): Promise<ApiResponseResult<User>> {
      const response = await authService.login(email, password);

      if (!response.error) {
        this.session = response.data.session;
        return {
          status: "success",
          data: response.data.user,
        };
      } else {
        switch (response.error.code) {
          case "invalid_credentials":
          case "MissingParameter":
          case "InvalidKey": {
            return {
              status: "error",
              message: GenericErrors.BAD_REQUEST,
            };
          }
          default:
            return {
              status: "error",
              message: GenericErrors.UNKNOWN_ERROR,
            };
        }
      }
    },
  },
});
