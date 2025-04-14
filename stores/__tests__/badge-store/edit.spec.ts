import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useBadgeStore } from "~/stores/badge.store";
import { badgeService } from "~/api/badgeService";

describe("BadgeStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Edit", () => {
    it("should return the awaited status with data on success", async () => {
      const badgeStore = useBadgeStore();
      const editBadgeMock = vi.fn(() => {
        return {
          error: null,
          data: [],
        };
      });
      vi.spyOn(badgeService, "edit", "get").mockReturnValueOnce(editBadgeMock);

      const badgeEditionResponse = await badgeStore.edit({
        id: "32145",
        name: "name",
        description: "description",
      });

      expect(editBadgeMock).toHaveBeenCalledTimes(1);
      expect(badgeEditionResponse).toEqual({
        status: "success",
      });
    });

    it("should return the awaited result on failure", async () => {
      const badgeStore = useBadgeStore();
      const editBadgeMock = vi.fn(() => {
        return {
          error: {
            code: "NoSuchKey",
            message: "Unknown key",
          },
          data: null,
        };
      });
      vi.spyOn(badgeService, "edit", "get").mockReturnValueOnce(editBadgeMock);

      const badgeEditionResponse = await badgeStore.edit({
        id: "32145",
        name: "name",
        description: "description",
      });

      expect(editBadgeMock).toHaveBeenCalledTimes(1);
      expect(badgeEditionResponse).toEqual({
        status: "error",
        message: "REQUEST_FAILED",
      });
    });
  });
});
