import { defineStore } from "pinia";
import { authService } from "~/api/authService";
import { wrapServiceCall } from "~/api/utils/wrapServiceCall";
import { GenericErrors, isObjectOfData, type ApiResponseResult } from "~/api";
import type { Session, User } from "@supabase/auth-js";

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
    setSession(session: Session | null) {
      this.session = session;
    },
    async login(
      email: string,
      password: string,
    ): Promise<ApiResponseResult<User>> {
      const response = await wrapServiceCall(
        authService.login(email, password),
      );

      return response.fold<ApiResponseResult<User>>(
        (errorValue) => ({
          status: "error",
          message: errorValue.message,
        }),
        (successValue) => {
          if (
            successValue.data &&
            isObjectOfData<User>(successValue.data.user) &&
            isObjectOfData<Session>(successValue.data.session)
          ) {
            this.setSession(successValue.data.session);
            return {
              status: "success",
              data: successValue.data.user,
            };
          }
          return {
            status: "error",
            message: GenericErrors.SERVER_ERROR,
          };
        },
      );
    },
    async logout(): Promise<ApiResponseResult<undefined>> {
      const response = await wrapServiceCall(authService.logout());

      if (response.isLeft()) {
        return {
          status: "error",
          message: GenericErrors.REQUEST_FAILED,
        };
      }
      this.$reset();
      return {
        status: "success",
      };
    },
  },
});
