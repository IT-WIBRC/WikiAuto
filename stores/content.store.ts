import type {
  ApiResponseResult,
  ContentCreation,
  ContentEdition,
  GetContentListType,
} from "~/api/types";
import { GenericErrors } from "~/api/types";
import { contentService } from "~/api/contentService";
import { imageService } from "~/api/imageService";
import { useAuthStore } from "~/stores/auth.store";

type ContentGetter = {
  contentList: GetContentListType[];
};

export const useContentStore = defineStore("content", {
  state: (): ContentGetter => ({
    contentList: [],
  }),
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
        this.contentList = response.data;
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

    async create(content: ContentCreation): Promise<ApiResponseResult<never>> {
      const { illustration, title, explanation, badges, status } = content;

      const fileExt = illustration.name.split(".").pop();
      const filePath = `${Math.random()}.${fileExt}`;

      const illustrationCreationResponse = await imageService.uploadFile(
        illustration,
        filePath,
      );

      if (illustrationCreationResponse.error) {
        return {
          status: "error",
          message: GenericErrors.REQUEST_FAILED,
        };
      }

      const contentCreated = await contentService.create(
        {
          title,
          explanation,
          badges,
          illustration: illustrationCreationResponse.data.path,
          status,
        },
        useAuthStore().session?.user?.email ?? "",
      );

      if (contentCreated.status === "completed") {
        return {
          status: "success",
        };
      }
      return {
        status: "error",
        message: GenericErrors.REQUEST_FAILED,
      };
    },

    async getImageURLFrom(path: string): Promise<ApiResponseResult<string>> {
      const response = await imageService.getPublicUrlFrom(path);

      if (!response.error) {
        return {
          status: "success",
          data: response.data.publicUrl,
        };
      } else {
        return {
          status: "error",
          message: GenericErrors.REQUEST_FAILED,
        };
      }
    },

    async edit(content: ContentEdition): Promise<ApiResponseResult<never>> {
      const {
        id,
        illustration,
        title,
        explanation,
        badges,
        status,
        userEmail,
      } = content;

      let filePath = illustration.name;
      if (!illustration.name.startsWith("0.")) {
        const fileExt = illustration.name.split(".").pop();
        filePath = `${Math.random()}.${fileExt}`;
      }

      const illustrationEditionResponse = await imageService.uploadFile(
        illustration,
        filePath,
      );

      if (illustrationEditionResponse.error) {
        return {
          status: "error",
          message: GenericErrors.REQUEST_FAILED,
        };
      }

      const contentEdited = await contentService.edit({
        id,
        title,
        explanation,
        badges,
        illustration: illustrationEditionResponse.data.path,
        status,
        userEmail,
      });

      if (contentEdited.status === "completed") {
        return {
          status: "success",
        };
      }
      return {
        status: "error",
        message: GenericErrors.REQUEST_FAILED,
      };
    },
  },
});
