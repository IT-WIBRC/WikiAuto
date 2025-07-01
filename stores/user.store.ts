import { authService } from "~/api/authService";
import {
  type ApiResponseResult,
  GenericErrors,
  type GetProfile,
  type EditProfileInfoPayload,
  handleSingleItemResponse,
} from "~/api";
import { wrapServiceCall } from "~/api/utils/wrapServiceCall";

type User = {
  id: string;
  email: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  created_at?: string;
};

type State = {
  currentUser: User;
  hasAlreadyFetchUserProfile: boolean;
};
export const useUserStore = defineStore("user", {
  state: (): State => ({
    currentUser: {} as User,
    hasAlreadyFetchUserProfile: false,
  }),

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
    async getProfile(): Promise<ApiResponseResult<GetProfile>> {
      if (!this.currentUser.id) {
        return {
          status: "error",
          message: GenericErrors.BAD_REQUEST,
        };
      }
      const result = await wrapServiceCall(
        authService.getUserProfile(this.currentUser.id),
      );

      return handleSingleItemResponse<
        GetProfile,
        ApiResponseResult<GetProfile>
      >(result, {
        onError: (errorValue) => {
          return {
            status: "error",
            message: errorValue,
          };
        },
        onFound: (successValue) => {
          this.setCurrentOtherUserInfo(successValue);
          this.markProfileAsFetched();

          return {
            status: "success",
            data: successValue,
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
    ): Promise<ApiResponseResult<undefined>> {
      const result = await wrapServiceCall(
        authService.editUserInfo(infoToEdit),
      );

      return handleSingleItemResponse<GetProfile, ApiResponseResult<undefined>>(
        result,
        {
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
        },
      );
    },
  },
  getters: {
    isAuthenticated(state): boolean {
      return !!state.currentUser;
    },
  },
});
