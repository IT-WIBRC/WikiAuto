import { handleSingleItemResponse, wrapServiceCall, type IEither } from "~/api";
import type {
  ResponseOnError,
  ResponseOnSuccess,
} from "~/shared/types/api/common";
import type {
  EditUserProfileDTO,
  EditUserProfileResponse,
  GetUserProfileDTO,
  GetUserProfileResponse,
} from "~/shared/types/api/server";
import { GenericErrors } from "~/shared/types/enums/GenericErrors";
import { $fetch } from "ofetch";

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
  getters: {
    isAuthenticated(state): boolean {
      return !!state.currentUser.id;
    },
  },
  actions: {
    setCurrentUserIdAndEmail(userId: string, email: string): void {
      this.currentUser.id = userId;
      this.currentUser.email = email;
    },
    setCurrentOtherUserInfo(userInfos: Partial<GetUserProfileDTO>): void {
      const { firstname, lastname, username, created_at } = userInfos!;

      this.currentUser.username = username ?? "";
      this.currentUser.firstname = firstname ?? "";
      this.currentUser.lastname = lastname ?? "";
      this.currentUser.created_at = created_at ?? "";
    },
    markProfileAsFetched() {
      this.hasAlreadyFetchUserProfile = true;
    },
    async getProfile(): Promise<GetUserProfileResponse> {
      if (!this.currentUser.id) {
        return {
          status: "error",
          code: GenericErrors.BAD_REQUEST,
        };
      }
      const fetchProfile = $fetch<GetUserProfileResponse>(
        "/api/users/profile",
        {
          method: "GET",
        },
      );

      const response: IEither<
        ResponseOnError,
        ResponseOnSuccess<GetUserProfileDTO>
      > = await wrapServiceCall(fetchProfile);

      return handleSingleItemResponse<
        GetUserProfileDTO,
        GetUserProfileResponse
      >(response, {
        onError: (errorOnError) => errorOnError,
        onFound: (successValue) => {
          this.setCurrentOtherUserInfo(successValue);
          this.markProfileAsFetched();

          return {
            status: "success",
            data: successValue,
          };
        },
        onNotFound: (notFoundError) => notFoundError,
      });
    },
    async updateInfo(
      infoToEdit: EditUserProfileDTO,
    ): Promise<EditUserProfileResponse<undefined>> {
      const updateUser = $fetch<EditUserProfileResponse>("/api/users/profile", {
        method: "PATCH",
        body: infoToEdit,
      });

      const result = await wrapServiceCall(updateUser);

      return handleSingleItemResponse<
        EditUserProfileDTO,
        EditUserProfileResponse<undefined>
      >(result, {
        onError: (errorOnError) => errorOnError,
        onFound: (updatedUser) => {
          this.setCurrentOtherUserInfo(updatedUser);
          return {
            status: "success",
          };
        },
        onNotFound: (notFoundError) => notFoundError,
      });
    },
  },
});
