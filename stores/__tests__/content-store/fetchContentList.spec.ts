import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useContentStore } from "../../content.store";
import { contentService } from "../../../api/contentService";

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
              name: "badge 1",
            },
          ],
          updated_at: "2024-12-14 13:25:08"
        },
      ];
      const getContentListMock = vi.fn(() => {
        return {
          error: null,
          data: result,
        };
      });
      vi.spyOn(contentService, "getContentList", "get").mockReturnValueOnce(
        getContentListMock,
      );

      const contentListResponse = await contentStore.fetchContentList();

      expect(getContentListMock).toHaveBeenCalledTimes(1);
      expect(contentListResponse).toEqual({
        status: "success",
        data: result,
      });
    });

    it("should return the awaited result on failure", async () => {
      const contentStore = useContentStore();
      const getContentListMock = vi.fn(() => {
        return {
          error: {
            code: "NoSuchKey",
            message: "Unknown key",
          },
          data: null,
        };
      });
      vi.spyOn(contentService, "getContentList", "get").mockReturnValueOnce(
        getContentListMock,
      );

      const contentListResponse = await contentStore.fetchContentList();

      expect(getContentListMock).toHaveBeenCalledTimes(1);
      expect(contentListResponse).toEqual({
        status: "error",
        message: "REQUEST_FAILED",
      });
    });

    it("should return an empty content list where there is not", async () => {
      const contentStore = useContentStore();
      const getContentListMock = vi.fn(() => {
        return {
          error: null,
          data: [],
        };
      });
      vi.spyOn(contentService, "getContentList", "get").mockReturnValueOnce(
        getContentListMock,
      );

      const contentListResponse = await contentStore.fetchContentList();

      expect(getContentListMock).toHaveBeenCalledTimes(1);
      expect(contentListResponse).toEqual({
        status: "success",
        data: [],
      });
    });
  });
});
