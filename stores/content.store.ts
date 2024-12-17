import type { ApiResponseResult, GetContentListType } from "~/api/types";
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
    async fetchTotalContentValidated(): Promise<ApiResponseResult<number>> {
      const response =
        await contentService.statistics.getTotalContentWithStatus("VALIDATED");

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

    async fetchContentList(): Promise<ApiResponseResult<GetContentListType[]>> {
      const response = await contentService.getContentList();

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
