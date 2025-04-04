import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useContentStore } from "~/stores/content.store";
import { contentService } from "../../../api/contentService";

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
      const editStatusMock = vi.fn(() => {
        return {
          status: "success",
        };
      });
      vi.spyOn(contentService, "editStatus", "get").mockReturnValueOnce(
        editStatusMock,
      );

      const contentListResponse = await contentStore.editStatus(
        "DRAFT",
        "1354665",
      );

      expect(editStatusMock).toHaveBeenCalledTimes(1);
      expect(editStatusMock).toHaveBeenCalledWith("DRAFT", "1354665");
      expect(contentListResponse).toEqual({
        status: "success",
      });
    });

    it("should return the awaited result on failure", async () => {
      const contentStore = useContentStore();
      const editStatusMock = vi.fn(() => {
        return {
          error: "error",
        };
      });
      vi.spyOn(contentService, "editStatus", "get").mockReturnValueOnce(
        editStatusMock,
      );

      const contentListResponse = await contentStore.editStatus(
        "DRAFT",
        "1354665",
      );

      expect(editStatusMock).toHaveBeenCalledTimes(1);
      expect(editStatusMock).toHaveBeenCalledWith("DRAFT", "1354665");
      expect(contentListResponse).toEqual({
        status: "error",
        message: "",
      });
    });
  });
});
