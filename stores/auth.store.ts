import { defineStore } from "pinia";
import { isObjectOfData, wrapServiceCall, type IEither } from "~/api";
import type { DBSession, DBUser } from "~/shared/types/data-access";
import { $fetch } from "ofetch";
import type {
  ApiResponseResult,
  ResponseOnError,
  ResponseOnSuccess,
} from "~/shared/types/api/common";
import type { LogoutApiResponse } from "~/shared/types/api/client";
import { GenericErrors } from "~/shared/types/enums/GenericErrors";
import { useApiClient } from "~/shared/utils/api-client";

type AuthState = {
  session: DBSession | null;
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
    setSession(session: DBSession | null) {
      this.session = session;
    },
    async login(
      email: string,
      password: string,
    ): Promise<ApiResponseResult<DBUser>> {
      try {
        const { data, error } = await useApiClient().auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          const uiError: ResponseOnError = {
            status: "error",
            code: GenericErrors.VALIDATION_ERROR,
            hint: error.message,
          };
          return uiError;
        }

        const isUserTypeValid = isObjectOfData<DBUser>(data.user);
        const isSessionTypeValid = isObjectOfData<DBSession>(data.session);

        if (isUserTypeValid && isSessionTypeValid) {
          this.setSession(data.session);
          return {
            status: "success",
            data: data.user,
          };
        }

        const uiError: ResponseOnError = {
          status: "error",
          code: GenericErrors.SERVER_ERROR,
          hint: "An unexpected error occurred. Please try again.",
        };
        return uiError;
      } catch (error: unknown) {
        const uiError: ResponseOnError = {
          status: "error",
          code: GenericErrors.SERVER_ERROR,
          hint: (error as Error).message,
        };
        return uiError;
      }
    },
    async logout(): Promise<ApiResponseResult> {
      const fetchPromise = $fetch<ApiResponseResult<LogoutApiResponse>>(
        "/api/auth/logout",
        {
          method: "POST",
          timeout: 3000,
        },
      );

      const response: IEither<
        ResponseOnError,
        ResponseOnSuccess<LogoutApiResponse>
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
