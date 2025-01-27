import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useBadgeStore } from "../../badge.store";
import { badgeService } from "../../../api/badgeService";

describe("BadgeStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Create", () => {
    it("should return the awaited status with data on success", async () => {
      const badgeStore = useBadgeStore();
      const getCreateBadgeMock = vi.fn(() => {
        return {
          error: null,
          data: [],
        };
      });
      vi.spyOn(badgeService, "create", "get").mockReturnValueOnce(
        getCreateBadgeMock,
      );

      const badgeListResponse = await badgeStore.create("name", "description");

      expect(getCreateBadgeMock).toHaveBeenCalledTimes(1);
      expect(badgeListResponse).toEqual({
        status: "success",
      });
    });

    it("should return the awaited result on failure", async () => {
      const badgeStore = useBadgeStore();
      const getCreateBadgeMock = vi.fn(() => {
        return {
          error: {
            code: "NoSuchKey",
            message: "Unknown key",
          },
          data: null,
        };
      });
      vi.spyOn(badgeService, "create", "get").mockReturnValueOnce(
        getCreateBadgeMock,
      );

      const badgeListResponse = await badgeStore.create("name", "description");

      expect(getCreateBadgeMock).toHaveBeenCalledTimes(1);
      expect(badgeListResponse).toEqual({
        status: "error",
        message: "REQUEST_FAILED",
      });
    });
  });
});
