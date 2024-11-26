import type { ApiResponseResult } from "~/api/types";
import { GenericErrors } from "~/api/types";
import { contentService } from "~/api/contentService";

export const useContentStore = defineStore("content", {
  actions: {
    async fetchTotalContent(): Promise<ApiResponseResult<number>> {
      const response = await contentService.statistics.getTotalContent();

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
  },
});
