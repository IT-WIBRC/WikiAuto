import type {
  ApiResponseResult,
  GetBadgeListTypeForOption,
  Badge,
} from "~/api/types";
import { GenericErrors } from "~/api/types";
import { badgeService } from "~/api/badgeService";

export const useBadgeStore = defineStore("badge", {
  actions: {
    async fetchBadgeListForOptions(): Promise<
      ApiResponseResult<GetBadgeListTypeForOption[]>
    > {
      const response = await badgeService.getBadgeListForOptions();

      if (!response.error) {
        return {
          status: "success",
          data: response.data,
        };
      } else {
        return {
          status: "error",
          message: GenericErrors.REQUEST_FAILED,
        };
      }
    },
    async create(
      name: string,
      description: string,
    ): Promise<ApiResponseResult<undefined>> {
      const response = await badgeService.create(name, description);

      if (!response.error) {
        return {
          status: "success",
        };
      } else {
        return {
          status: "error",
          message: GenericErrors.REQUEST_FAILED,
        };
      }
    },
    async fetchTotalBadges(): Promise<ApiResponseResult<number>> {
      const response = await badgeService.statistics.getTotalBadge();

      if (!response.error) {
        return {
          status: "success",
          data: response.count,
        };
      } else {
        switch (response.error.code) {
          case "NoSuchKey":
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
    async fetchBadgeList(): Promise<ApiResponseResult<Badge[]>> {
      const response = await badgeService.getBadgeList();

      if (!response.error) {
        return {
          status: "success",
          data: response.data,
        };
      } else {
        return {
          status: "error",
          message: GenericErrors.REQUEST_FAILED,
        };
      }
    },
  },
});
