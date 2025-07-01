import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useContentStore } from "~/stores/content.store";
import { contentService } from "~/api";

describe("ContentStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("fetchContentList", () => {
    it("should return the awaited list on success", async () => {
      const contentStore = useContentStore();
      const result = [
        {
          content_id: "12345",
          status: "Validated",
          title: "My title",
          user_email: "email@email.com",
          badges: [
            {
              name: "badge-service 1",
              badge_id: "1235456",
              description: "description 1",
            },
          ],
          updated_at: "2024-12-14 13:25:08",
          image: "",
          created_at: "",
          explanation: "",
        },
      ];

      const getContentListMock = vi
        .spyOn(contentService, "getContentList")
        .mockResolvedValueOnce({
          error: null,
          data: result,
        });

      const contentListResponse = await contentStore.fetchContentList();

      expect(getContentListMock).toHaveBeenCalledTimes(1);
      expect(contentListResponse).toEqual({
        status: "success",
        data: result,
      });
    });

    it("should return the awaited result on failure", async () => {
      const contentStore = useContentStore();
      const getContentListMock = vi
        .spyOn(contentService, "getContentList")
        .mockResolvedValueOnce({
          error: {
            code: "NoSuchKey",
            message: "Unknown key",
            details: "",
            hint: "",
            name: "",
          },
          data: null,
          count: null,
          status: 0,
          statusText: "",
        });

      const contentListResponse = await contentStore.fetchContentList();

      expect(getContentListMock).toHaveBeenCalledTimes(1);
      expect(contentListResponse).toEqual({
        status: "error",
        message: "UNKNOWN_ERROR",
      });
    });

    it("should return an empty content list where there is not", async () => {
      const contentStore = useContentStore();
      const getContentListMock = vi
        .spyOn(contentService, "getContentList")
        .mockResolvedValueOnce({
          error: null,
          data: [],
          count: null,
          status: 0,
          statusText: "",
        });

      const contentListResponse = await contentStore.fetchContentList();

      expect(getContentListMock).toHaveBeenCalledTimes(1);
      expect(contentListResponse).toEqual({
        status: "success",
        data: [],
      });
    });
  });
});
