import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useContentStore } from "~/stores/content.store";
import { GenericErrors, imageService } from "~/api";
import { flushPromises } from "@vue/test-utils";
import { StorageError } from "@supabase/storage-js";

describe("ContentStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getImageURLFrom", () => {
    it("should return the awaited image public url on success", async () => {
      const contentStore = useContentStore();
      const result = {
        publicUrl: "http://localhost/image.png",
      };

      const getImageURLFromMock = vi
        .spyOn(imageService, "getPublicUrlFrom")
        .mockResolvedValueOnce({
          data: result,
          error: null,
        });

      const contentListResponse =
        await contentStore.getImageURLFrom("image.png");
      await flushPromises();

      expect(getImageURLFromMock).toHaveBeenCalledTimes(1);
      expect(getImageURLFromMock).toHaveBeenCalledWith("image.png");
      expect(contentListResponse).toEqual({
        status: "success",
        data: result.publicUrl,
      });
    });

    it("should return the awaited result on failure", async () => {
      const contentStore = useContentStore();

      const getImageURLFromMock = vi
        .spyOn(imageService, "getPublicUrlFrom")
        .mockResolvedValueOnce({
          data: null,
          error: new StorageError("Unknown file path"),
        });

      const contentListResponse =
        await contentStore.getImageURLFrom("image.png");
      await flushPromises();

      expect(getImageURLFromMock).toHaveBeenCalledTimes(1);
      expect(getImageURLFromMock).toHaveBeenCalledWith("image.png");
      expect(contentListResponse).toEqual({
        status: "error",
        message: GenericErrors.UNKNOWN_ERROR,
      });
    });
  });
});
