import type {
  ApiResponseResult,
  ContentCreation,
  ContentEdition,
  GetContentListItem,
  CONTENT_STATUS,
  ServiceWrapperSuccess,
} from "~/api";
import {
  contentService,
  imageService,
  GenericErrors,
  handleListResponse,
  handleSingleItemResponse,
  processEitherResult,
  Either,
  wrapServiceCall,
} from "~/api";
import { useAuthStore } from "~/stores/auth.store";
import type { ContentIdResponse } from "~/api/contentService";

type ContentGetter = {
  contentList: GetContentListItem[];
};

export const useContentStore = defineStore("content", {
  state: (): ContentGetter => ({
    contentList: [],
  }),
  actions: {
    async fetchTotalContent(): Promise<ApiResponseResult<number>> {
      const response = await wrapServiceCall(
        contentService.statistics.getTotalContent(),
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
          onError: (errorMessage) => ({
            status: "error",
            message: errorMessage,
          }),
        },
      );
    },

    async fetchTotalContentValidated(): Promise<ApiResponseResult<number>> {
      const response = await wrapServiceCall(
        contentService.statistics.getTotalContentWithStatus("VALIDATED"),
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
          onError: (errorMessage) => ({
            status: "error",
            message: errorMessage,
          }),
        },
      );
    },

    async fetchContentList(): Promise<ApiResponseResult<GetContentListItem[]>> {
      const response = await wrapServiceCall(contentService.getContentList());

      return handleListResponse<
        GetContentListItem,
        ApiResponseResult<GetContentListItem[]>
      >(response, {
        onFoundList: (data) => {
          this.contentList = data;
          return {
            status: "success",
            data,
          };
        },
        onEmptyList: () => {
          this.contentList = [];
          return {
            status: "success",
            data: [],
          };
        },
        onError: (message) => ({
          status: "error",
          message,
        }),
      });
    },

    async create(
      content: ContentCreation,
    ): Promise<ApiResponseResult<undefined>> {
      const { illustration, title, explanation, badges, status } = content;

      const fileExt = illustration.name.split(".").pop();
      const filePath = `${Math.random()}.${fileExt}`;

      const uploadEither = await wrapServiceCall(
        imageService.uploadFile(illustration, filePath),
      );

      if (uploadEither.isLeft()) {
        return {
          status: "error",
          message: GenericErrors.UPLOAD_FAILED_NO_PATH,
        };
      }

      const finalResultEither = await uploadEither.asyncFlatMap<
        ServiceWrapperSuccess<ContentIdResponse>
      >(async (uploadSuccessData) => {
        if (!uploadSuccessData.data || !uploadSuccessData.data.path) {
          return Either.left({
            status: "error",
            message: GenericErrors.UPLOAD_FAILED_NO_PATH,
          });
        }

        const illustrationPath = uploadSuccessData.data.path;

        const contentCreationEither = await wrapServiceCall(
          contentService.create(
            {
              title,
              explanation,
              badges,
              illustration: illustrationPath,
              status,
            },
            useAuthStore().session?.user?.email ?? "",
          ),
        );

        return contentCreationEither;
      });

      return processEitherResult(finalResultEither, () => undefined);
    },

    async getImageURLFrom(path: string): Promise<ApiResponseResult<string>> {
      const response = await wrapServiceCall(
        imageService.getPublicUrlFrom(path),
      );

      return handleSingleItemResponse<
        { publicUrl: string },
        ApiResponseResult<string>
      >(response, {
        onFound: (data) => ({
          status: "success",
          data: data.publicUrl,
        }),
        onError: (errorMessage) => ({
          status: "error",
          message: errorMessage,
        }),
      });
    },

    async edit(content: ContentEdition): Promise<ApiResponseResult<undefined>> {
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

      const uploadEither = await wrapServiceCall(
        imageService.uploadFile(illustration, filePath),
      );

      if (uploadEither.isLeft()) {
        return {
          status: "error",
          message: GenericErrors.UPLOAD_FAILED_NO_PATH,
        };
      }

      const finalResultEither = await uploadEither.asyncFlatMap<
        ServiceWrapperSuccess<ContentIdResponse>
      >(async (uploadSuccessData) => {
        if (!uploadSuccessData.data || !uploadSuccessData.data.path) {
          return Either.left({
            status: "error",
            message: GenericErrors.UPLOAD_FAILED_NO_PATH,
          });
        }

        const illustrationPath = uploadSuccessData.data.path;

        const contentEditionEither = await wrapServiceCall(
          contentService.edit({
            id,
            title,
            explanation,
            badges,
            illustration: illustrationPath,
            status,
            userEmail,
          }),
        );

        return contentEditionEither;
      });

      return processEitherResult(finalResultEither, () => undefined);
    },

    async editStatus(
      status: keyof typeof CONTENT_STATUS,
      id: string,
    ): Promise<ApiResponseResult<undefined>> {
      const response = await wrapServiceCall(
        contentService.editStatus(status, id),
      );
      return handleSingleItemResponse<unknown, ApiResponseResult<undefined>>(
        response,
        {
          onFound: () => ({
            status: "success",
          }),
          onNotFound: () => ({
            status: "success",
          }),
          onError: (errorMessage) => ({
            status: "error",
            message: errorMessage,
          }),
        },
      );
    },
  },
});
