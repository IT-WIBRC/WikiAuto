import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useContentStore } from "~/stores/content.store";
import { contentService, GenericErrors } from "~/api";

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
      const getTotalContentMock = vi
        .spyOn(contentService.statistics, "getTotalContent")
        .mockResolvedValueOnce({
          error: null,
          data: [],
          count: 15,
          status: 10,
          statusText: "",
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
      const getTotalContentMock = vi
        .spyOn(contentService.statistics, "getTotalContent")
        .mockResolvedValueOnce({
          error: {
            code: "PGRST301",
            hint: "",
            message: "",
            details: "",
            name: "",
          },
          data: null,
          count: null,
          status: 10,
          statusText: "",
        });

      const totalContentResponse = await contentStore.fetchTotalContent();

      expect(getTotalContentMock).toHaveBeenCalledTimes(1);
      expect(totalContentResponse).toEqual({
        status: "error",
        message: GenericErrors.UNAUTHORIZED,
      });
    });

    it("should return the awaited result on unknown error", async () => {
      const contentStore = useContentStore();
      const getTotalContentMock = vi
        .spyOn(contentService.statistics, "getTotalContent")
        .mockResolvedValueOnce({
          error: {
            code: "PGR",
            hint: "",
            message: "",
            details: "",
            name: "",
          },
          data: null,
          count: null,
          status: 10,
          statusText: "",
        });

      const totalContentResponse = await contentStore.fetchTotalContent();

      expect(getTotalContentMock).toHaveBeenCalledTimes(1);
      expect(totalContentResponse).toEqual({
        status: "error",
        message: GenericErrors.UNKNOWN_ERROR,
      });
    });
  });
});
