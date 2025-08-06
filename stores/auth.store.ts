import { defineStore } from "pinia";
import {
  GenericErrors,
  isObjectOfData,
  wrapServiceCall,
  type IEither,
} from "~/api";
import type { Session, User } from "@supabase/auth-js";
import { $fetch } from "ofetch";
import type {
  ApiResponseResult, ResponseOnError, ResponseOnSuccess
} from "~/shared/types/api/common";
import type {
  LoginApiRawResponse,
  LogoutApiRawResponse
} from "~/shared/types/api/client";

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
      const fetchPromise = $fetch<ApiResponseResult<LoginApiRawResponse>>(
        "/api/auth/login", {
          method: "POST",
          body: {
            email,
            password,
          },
        });

      const response: IEither<
        ResponseOnError,
        ResponseOnSuccess<LoginApiRawResponse>
      > = await wrapServiceCall(fetchPromise);

      return response.fold(
        (errorValue) => errorValue,
        (successWrapper) => {
          const apiData = successWrapper.data;

          const isUserTypeValid = isObjectOfData<User>(apiData.user);
          const isSessionTypeValid = isObjectOfData<Session>(apiData.session);

          if (isUserTypeValid && isSessionTypeValid) {
            this.setSession(apiData.session);
            return {
              status: "success",
              data: apiData.user,
            };
          }

          const uiError: ResponseOnError = {
            status: "error",
            code: GenericErrors.SERVER_ERROR,
          };
          return uiError;
        },
      );
    },
    async logout(): Promise<ApiResponseResult> {
      const fetchPromise = $fetch<ApiResponseResult<LogoutApiRawResponse>>(
        "/api/auth/logout", {
          method: "POST",
          timeout: 3000,
        });

      const response: IEither<
        ResponseOnError,
        ResponseOnSuccess<LogoutApiRawResponse>
      > = await wrapServiceCall(fetchPromise);

      if (response.isLeft()) {
        return response._value;
      }

      this.$reset();
      return {
        status: "success",
      };
    },
  },
});
