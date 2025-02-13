import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useContentStore } from "~/stores/content.store";
import { imageService } from "~/api/imageService";

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
      const getImageURLFromMock = vi.fn(() => {
        return {
          error: null,
          data: result,
        };
      });
      vi.spyOn(imageService, "getPublicUrlFrom", "get").mockReturnValueOnce(
        getImageURLFromMock,
      );

      const contentListResponse =
        await contentStore.getImageURLFrom("image.png");

      expect(getImageURLFromMock).toHaveBeenCalledTimes(1);
      expect(getImageURLFromMock).toHaveBeenCalledWith("image.png");
      expect(contentListResponse).toEqual({
        status: "success",
        data: result.publicUrl,
      });
    });

    it("should return the awaited result on failure", async () => {
      const contentStore = useContentStore();
      const getImageURLFromMock = vi.fn(() => {
        return {
          error: {
            code: "NoSuchKey",
            message: "Unknown key",
          },
          data: null,
        };
      });
      vi.spyOn(imageService, "getPublicUrlFrom", "get").mockReturnValueOnce(
        getImageURLFromMock,
      );

      const contentListResponse =
        await contentStore.getImageURLFrom("image.png");

      expect(getImageURLFromMock).toHaveBeenCalledTimes(1);
      expect(getImageURLFromMock).toHaveBeenCalledWith("image.png");
      expect(contentListResponse).toEqual({
        status: "error",
        message: "REQUEST_FAILED",
      });
    });
  });
});
