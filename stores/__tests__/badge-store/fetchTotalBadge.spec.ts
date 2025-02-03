import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { badgeService } from "../../../api/badgeService";
import { useBadgeStore } from "../../badge.store";

describe("BadgeStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("fetchTotalBadge", () => {
    it("should return the awaited result on success", async () => {
      const badgeStore = useBadgeStore();
      const getTotalBadgeMock = vi.fn(() => {
        return {
          error: null,
          data: [],
          count: 15,
        };
      });
      vi.spyOn(badgeService, "statistics", "get").mockReturnValueOnce({
        getTotalBadge: getTotalBadgeMock,
      });

      const totalContentResponse = await badgeStore.fetchTotalBadges();

      expect(getTotalBadgeMock).toHaveBeenCalledTimes(1);
      expect(totalContentResponse).toEqual({
        status: "success",
        data: 15,
      });
    });

    it("should return the awaited result on known error", async () => {
      const badgeStore = useBadgeStore();
      const getTotalBadgeMock = vi.fn(() => {
        return {
          error: {
            code: "NoSuchKey",
            message: "Unknown key",
          },
          data: null,
          count: 0,
        };
      });
      vi.spyOn(badgeService, "statistics", "get").mockReturnValueOnce({
        getTotalBadge: getTotalBadgeMock,
      });

      const totalBadgeResponse = await badgeStore.fetchTotalBadges();

      expect(getTotalBadgeMock).toHaveBeenCalledTimes(1);
      expect(totalBadgeResponse).toEqual({
        status: "error",
        message: "BAD_REQUEST",
      });
    });

    it("should return the awaited result on unknown error", async () => {
      const badgeStore = useBadgeStore();
      const getTotalBadgeMock = vi.fn(() => {
        return {
          error: {
            code: "ServerError",
            message: "Unknown key",
          },
          data: null,
          count: 0,
        };
      });
      vi.spyOn(badgeService, "statistics", "get").mockReturnValueOnce({
        getTotalBadge: getTotalBadgeMock,
      });

      const totalBadgeResponse = await badgeStore.fetchTotalBadges();

      expect(getTotalBadgeMock).toHaveBeenCalledTimes(1);
      expect(totalBadgeResponse).toEqual({
        status: "error",
        message: "UNKNOWN_ERROR",
      });
    });
  });
});
