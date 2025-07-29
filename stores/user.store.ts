import { authService } from "~/api/authService";
import {
  type UIApiResponseResult,
  GenericErrors,
  type GetProfile,
  type EditProfileInfoPayload,
  handleSingleItemResponse,
  wrapServiceCall,
  type ServiceWrapperSuccess,
  type UIResponseOnError,
  type IEither,
} from "~/api";

type User = {
  id: string;
  email: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  created_at?: string;
};

interface GetUserProfileApiRawResponse {
  profile: GetProfile;
  error?: {
    message: string;
  } | null;
}

type State = {
  currentUser: User;
  hasAlreadyFetchUserProfile: boolean;
};
export const useUserStore = defineStore("user", {
  state: (): State => ({
    currentUser: {} as User,
    hasAlreadyFetchUserProfile: false,
  }),
  getters: {
    isAuthenticated(state): boolean {
      return !!state.currentUser;
    },
  },
  actions: {
    setCurrentUserIdAndEmail(userId: string, email: string): void {
      this.currentUser.id = userId;
      this.currentUser.email = email;
    },
    setCurrentOtherUserInfo(userInfos: GetProfile): void {
      const { firstname, lastname, username, created_at } = userInfos!;

      this.currentUser.username = username ?? "";
      this.currentUser.firstname = firstname ?? "";
      this.currentUser.lastname = lastname ?? "";
      this.currentUser.created_at = created_at ?? "";
    },
    markProfileAsFetched() {
      this.hasAlreadyFetchUserProfile = true;
    },
    async getProfile(): Promise<UIApiResponseResult<GetProfile>> {
      if (!this.currentUser.id) {
        return {
          status: "error",
          message: GenericErrors.BAD_REQUEST,
        };
      }
      const fetchPromise = $fetch<GetUserProfileApiRawResponse>(
        "/api/auth/profile",
        {
          method: "GET",
        },
      );

      const response: IEither<
        UIResponseOnError,
        ServiceWrapperSuccess<GetUserProfileApiRawResponse>
      > = await wrapServiceCall(fetchPromise);

      return handleSingleItemResponse<
        GetUserProfileApiRawResponse,
        UIApiResponseResult<GetProfile>
      >(response, {
        onError: (errorValue) => {
          return {
            status: "error",
            message: errorValue,
          };
        },
        onFound: (successValue) => {
          this.setCurrentOtherUserInfo(successValue.profile);
          this.markProfileAsFetched();

          return {
            status: "success",
            data: successValue.profile,
          };
        },
        onNotFound: () => {
          return {
            status: "error",
            message: GenericErrors.NOT_FOUND,
          };
        },
      });
    },
    async updateInfo(
      infoToEdit: EditProfileInfoPayload,
    ): Promise<UIApiResponseResult<undefined>> {
      const result = await wrapServiceCall(
        authService.editUserInfo(infoToEdit),
      );

      return handleSingleItemResponse<
        GetProfile,
        UIApiResponseResult<undefined>
      >(result, {
        onError: (errorValue) => {
          return {
            status: "error",
            message: errorValue,
          };
        },
        onFound: (updatedUser) => {
          this.setCurrentOtherUserInfo(updatedUser);
          return {
            status: "success",
          };
        },
        onNotFound: () => {
          return {
            status: "error",
            message: GenericErrors.NOT_FOUND,
          };
        },
      });
    },
  },
});
