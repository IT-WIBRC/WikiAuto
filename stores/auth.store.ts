import { defineStore } from "pinia";
import {
  GenericErrors,
  isObjectOfData,
  type UIApiResponseResult,
  type UIResponseOnError,
  wrapServiceCall,
  type ServiceWrapperSuccess,
  type IEither,
} from "~/api";
import type { Session, User } from "@supabase/auth-js";
import { $fetch } from "ofetch";

interface LoginApiRawResponse {
  user: User;
  session: Session;
  error?: {
    message: string;
  } | null;
}

interface LogoutApiRawResponse {
  message: string;
  error?: {
    message: string;
  } | null;
}

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
    ): Promise<UIApiResponseResult<User>> {
      const fetchPromise = $fetch<LoginApiRawResponse>("/api/auth/login", {
        method: "POST",
        body: {
          email,
          password
        },
      });

      const response: IEither<
      UIResponseOnError,
      ServiceWrapperSuccess<LoginApiRawResponse>
      > = await wrapServiceCall(fetchPromise);

      return response.fold<UIApiResponseResult<User>>(
        (errorValue: UIResponseOnError) => {
          const uiErrorMessage: string =
          errorValue.message || GenericErrors.UNKNOWN_ERROR;
          const uiError: UIResponseOnError = {
            status: "error",
            message: uiErrorMessage,
          };
          return uiError;
        },
        (successWrapper: ServiceWrapperSuccess<LoginApiRawResponse>) => {
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

          const uiError: UIResponseOnError = {
            status: "error",
            message: GenericErrors.SERVER_ERROR,
          };
          return uiError;
        },
      );
    },
    async logout(): Promise<UIApiResponseResult<undefined>> {
      const fetchPromise = $fetch<LogoutApiRawResponse>("/api/auth/logout", {
        method: "POST",
      });

      const response: IEither<
      UIResponseOnError,
      ServiceWrapperSuccess<LogoutApiRawResponse>
      > = await wrapServiceCall(fetchPromise);

      if (response.isLeft()) {
        const errorValue = response._value;
        const uiErrorMessage: string =
        errorValue.message || GenericErrors.UNKNOWN_ERROR;
        const uiError: UIResponseOnError = {
          status: "error",
          message: uiErrorMessage,
        };
        return uiError;
      }

      this.$reset();
      return {
        status: "success",
      };
    },
  },
});
