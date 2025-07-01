import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useContentStore } from "~/stores/content.store";
import { contentService, GenericErrors } from "~/api";
import { flushPromises } from "@vue/test-utils";

describe("ContentStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("EditStatus", () => {
    it("should return the awaited status on success", async () => {
      const contentStore = useContentStore();
      const editStatusServiceMock = vi
        .spyOn(contentService, "editStatus")
        .mockResolvedValueOnce({
          data: null,
          error: null,
          count: null,
          status: 0,
          statusText: "",
        });

      const editStatusResponse = await contentStore.editStatus(
        "DRAFT",
        "1354665",
      );
      await flushPromises();

      expect(editStatusServiceMock).toHaveBeenCalledTimes(1);
      expect(editStatusServiceMock).toHaveBeenCalledWith("DRAFT", "1354665");
      expect(editStatusResponse).toEqual({
        status: "success",
      });
    });

    it("should return the awaited result on failure", async () => {
      const contentStore = useContentStore();
      const editStatusServiceMock = vi
        .spyOn(contentService, "editStatus")
        .mockResolvedValueOnce({
          data: null,
          error: {
            code: "PGRST301",
            hint: "",
            message: "",
            details: "",
            name: "",
          },
          count: null,
          status: 0,
          statusText: "",
        });

      const editStatusResponse = await contentStore.editStatus(
        "DRAFT",
        "1354665",
      );
      await flushPromises();

      expect(editStatusServiceMock).toHaveBeenCalledTimes(1);
      expect(editStatusServiceMock).toHaveBeenCalledWith("DRAFT", "1354665");
      expect(editStatusResponse).toEqual({
        status: "error",
        message: GenericErrors.UNAUTHORIZED,
      });
    });
  });
});
