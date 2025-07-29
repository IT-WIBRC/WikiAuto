import type {
  ApiResponseResult,
  GetBadgeListTypeForOption,
  Badge,
} from "~/api";
import { badgeService } from "~/api/badgeService";
import { wrapServiceCall } from "~/api/utils/wrapServiceCall";
import {
  handleListResponse,
  handleSingleItemResponse,
  GenericErrors
} from "~/api";

type BadgeState = {
  badgeList: Badge[];
};

export const useBadgeStore = defineStore("badge", {
  state: (): BadgeState => ({
    badgeList: [],
  }),
  actions: {
    setBadges(badges: Badge[]) {
      this.badgeList = badges;
    },
    async fetchBadgeListForOptions(): Promise<
      ApiResponseResult<GetBadgeListTypeForOption[]>
    > {
      const response = await wrapServiceCall(
        badgeService.getBadgeListForOptions(),
      );

      return handleListResponse<
        GetBadgeListTypeForOption,
        ApiResponseResult<GetBadgeListTypeForOption[]>
      >(response, {
        onFoundList: (data) => ({
          status: "success",
          data,
        }),
        onEmptyList: () => {
          return {
            status: "success",
            data: [],
          };
        },
        onError: (message) => ({
          status: "error",
          message: message,
        }),
      });
    },
    async create(
      name: string,
      description: string,
    ): Promise<ApiResponseResult<undefined>> {
      const response = await wrapServiceCall(
        badgeService.create(name, description),
      );
      return handleSingleItemResponse<Badge, ApiResponseResult<undefined>>(
        response,
        {
          onFound: () => {
            return { status: "success" };
          },
          onNotFound: () => {
            return { status: "success" };
          },
          onError: (errorMessage) => {
            return {
              status: "error",
              message: errorMessage,
            };
          },
        },
      );
    },
    async edit({
      name,
      description,
      id,
    }: {
      name: string;
      description: string;
      id: string;
    }): Promise<ApiResponseResult<undefined>> {
      const response = await wrapServiceCall(
        badgeService.edit(id, name, description),
      );

      return handleSingleItemResponse<unknown, ApiResponseResult<undefined>>(
        response,
        {
          onFound: () => {
            return { status: "success" };
          },
          onNotFound: () => {
            return { status: "success" };
          },
          onError: (errorMessage) => {
            return {
              status: "error",
              message: errorMessage,
            };
          },
        },
      );
    },
    async fetchBadgeCount(): Promise<ApiResponseResult<number>> {
      const response = await wrapServiceCall(
        badgeService.statistics.countAllBadges(),
      );

      return handleSingleItemResponse<unknown, ApiResponseResult<number>>(
        response,
        {
          onFound: (_, count) => {
            if (typeof count === "number") {
              return {
                status: "success",
                data: count,
              };
            }
            return {
              status: "error",
              message: GenericErrors.UNKNOWN_ERROR,
            };
          },
          onNotFound: (count) => {
            if (typeof count === "number") {
              return {
                status: "success",
                data: count,
              };
            }
            return {
              status: "error",
              message: GenericErrors.NO_DATA_FOUND,
            };
          },
          onError: (errorMessage) => {
            return {
              status: "error",
              message: errorMessage,
            };
          },
        },
      );
    },
    async fetchBadgeList(): Promise<ApiResponseResult<Badge[]>> {
      const response = await wrapServiceCall(badgeService.getBadgeList());

      return handleListResponse<Badge, ApiResponseResult<Badge[]>>(response, {
        onFoundList: (data) => {
          this.setBadges(data);
          return {
            status: "success",
            data,
          };
        },
        onEmptyList: () => {
          this.setBadges([]);
          return {
            status: "success",
            data: [],
          };
        },
        onError: (message) => ({
          status: "error",
          message: message,
        }),
      });
    },
  },
});
