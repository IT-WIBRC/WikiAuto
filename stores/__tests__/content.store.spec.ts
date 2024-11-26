import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useContentStore } from "../content.store";
import { contentService } from "../../api/contentService";

describe("ContentStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("fetchTotalContent", () => {
    it("should return the awaited result on success", async () => {
      const contentStore = useContentStore();
      const getTotalContentMock = vi.fn(() => {
        return {
          error: null,
          data: [],
          count: 15,
        };
      });
      vi.spyOn(contentService, "statistics", "get").mockReturnValueOnce({
        getTotalContent: getTotalContentMock,
      });

      const totalContentResponse = await contentStore.fetchTotalContent();

      expect(getTotalContentMock).toHaveBeenCalledTimes(1);
      expect(totalContentResponse).toEqual({
        status: "success",
        data: 15,
      });
    });

    it("should return the awaited result on known error", async () => {
      const contentStore = useContentStore();
      const getTotalContentMock = vi.fn(() => {
        return {
          error: {
            code: "NoSuchKey",
            message: "Unknown key",
          },
          data: null,
          count: 0,
        };
      });
      vi.spyOn(contentService, "statistics", "get").mockReturnValueOnce({
        getTotalContent: getTotalContentMock,
      });

      const totalContentResponse = await contentStore.fetchTotalContent();

      expect(getTotalContentMock).toHaveBeenCalledTimes(1);
      expect(totalContentResponse).toEqual({
        status: "error",
        message: "BAD_REQUEST",
      });
    });

    it("should return the awaited result on unknown error", async () => {
      const contentStore = useContentStore();
      const getTotalContentMock = vi.fn(() => {
        return {
          error: {
            code: "ServerError",
            message: "Unknown key",
          },
          data: null,
          count: 0,
        };
      });
      vi.spyOn(contentService, "statistics", "get").mockReturnValueOnce({
        getTotalContent: getTotalContentMock,
      });

      const totalContentResponse = await contentStore.fetchTotalContent();

      expect(getTotalContentMock).toHaveBeenCalledTimes(1);
      expect(totalContentResponse).toEqual({
        status: "error",
        message: "UNKNOWN_ERROR",
      });
    });
  });
});
