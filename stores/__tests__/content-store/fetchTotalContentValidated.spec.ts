import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useContentStore } from "~/stores/content.store";
import { CONTENT_STATUS, contentService, GenericErrors } from "~/api";

describe("ContentStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("fetchTotalContentValidated", () => {
    it("should return the awaited result on success", async () => {
      const contentStore = useContentStore();
      const getTotalContentValidatedMock = vi
        .spyOn(contentService.statistics, "getTotalContentWithStatus")
        .mockResolvedValueOnce({
          error: null,
          data: [],
          count: 15,
          status: 10,
          statusText: "",
        });

      const totalContentResponse =
        await contentStore.fetchTotalContentValidated();

      expect(getTotalContentValidatedMock).toHaveBeenCalledTimes(1);
      expect(getTotalContentValidatedMock).toHaveBeenCalledWith(
        CONTENT_STATUS.VALIDATED,
      );
      expect(totalContentResponse).toEqual({
        status: "success",
        data: 15,
      });
    });

    it("should return the awaited result on known error", async () => {
      const contentStore = useContentStore();
      const getTotalContentValidatedMock = vi
        .spyOn(contentService.statistics, "getTotalContentWithStatus")
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

      const totalContentResponse =
        await contentStore.fetchTotalContentValidated();

      expect(getTotalContentValidatedMock).toHaveBeenCalledTimes(1);
      expect(getTotalContentValidatedMock).toHaveBeenCalledWith(
        CONTENT_STATUS.VALIDATED,
      );
      expect(totalContentResponse).toEqual({
        status: "error",
        message: GenericErrors.UNAUTHORIZED,
      });
    });

    it("should return the awaited result on unknown error", async () => {
      const contentStore = useContentStore();
      const getTotalContentValidatedMock = vi
        .spyOn(contentService.statistics, "getTotalContentWithStatus")
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

      const totalContentResponse =
        await contentStore.fetchTotalContentValidated();

      expect(getTotalContentValidatedMock).toHaveBeenCalledTimes(1);
      expect(getTotalContentValidatedMock).toHaveBeenCalledWith(
        CONTENT_STATUS.VALIDATED,
      );
      expect(totalContentResponse).toEqual({
        status: "error",
        message: GenericErrors.UNKNOWN_ERROR,
      });
    });
  });
});
