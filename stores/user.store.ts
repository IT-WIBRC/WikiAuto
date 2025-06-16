import { authService } from "~/api/authService";
import {
  type ApiResponseResult,
  GenericErrors,
  type GetProfile,
  type EditUserInfoPayload,
} from "~/api/types";
import { wrapServiceCall } from "~/api/wrapServiceCall";

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
      const result = await wrapServiceCall(
        authService.getUserProfile(this.currentUser.id),
      );

      if (result.status === "success") {
        if (result.response.data) {
          this.setCurrentOtherUserInfo(result.response.data);
          this.markProfileAsFetched();

          return {
            status: "success",
            data: undefined,
          };
        }
        return {
          status: "error",
          message: GenericErrors.UNKNOWN_ERROR,
        };
      } else return result;
    },
    async updateInfo(
      infoToEdit: EditUserInfoPayload,
    ): Promise<ApiResponseResult> {
      const result = await wrapServiceCall(
        authService.editUserInfo(infoToEdit),
      );

      if (result.status === "success") {
        if (result.response.data && !Array.isArray(result.response.data)) {
          this.setCurrentOtherUserInfo(result.response.data);
          return {
            status: "success",
            data: result.response.data,
          };
        }
        return {
          status: "error",
          message: GenericErrors.UNKNOWN_ERROR,
        };
      } else return result;
    },
  },
  getters: {
    isAuthenticated(state): boolean {
      return !!state.currentUser;
    },
  },
});
