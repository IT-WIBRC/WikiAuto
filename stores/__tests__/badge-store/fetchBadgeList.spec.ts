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

  describe("fetchBadgeList", () => {
    it("should return the awaited list on success", async () => {
      const badgeStore = useBadgeStore();
      const result = [
        {
          content_id: "12345",
          name: "My title",
          description: "My description",
        },
      ];
      const getBadgeListMock = vi.fn(() => {
        return {
          error: null,
          data: result,
        };
      });
      vi.spyOn(badgeService, "getBadgeList", "get").mockReturnValueOnce(
        getBadgeListMock,
      );

      const badgeListResponse = await badgeStore.fetchBadgeList();

      expect(getBadgeListMock).toHaveBeenCalledTimes(1);
      expect(badgeListResponse).toEqual({
        status: "success",
        data: result,
      });
    });

    it("should return the awaited result on failure", async () => {
      const badgeStore = useBadgeStore();
      const getBadgeListMock = vi.fn(() => {
        return {
          error: {
            code: "NoSuchKey",
            message: "Unknown key",
          },
          data: null,
        };
      });
      vi.spyOn(badgeService, "getBadgeList", "get").mockReturnValueOnce(
        getBadgeListMock,
      );

      const badgeListResponse = await badgeStore.fetchBadgeList();

      expect(getBadgeListMock).toHaveBeenCalledTimes(1);
      expect(badgeListResponse).toEqual({
        status: "error",
        message: "REQUEST_FAILED",
      });
    });

    it("should return an empty content list where there is not", async () => {
      const badgeStore = useBadgeStore();
      const getBadgeListMock = vi.fn(() => {
        return {
          error: null,
          data: [],
        };
      });
      vi.spyOn(badgeService, "getBadgeList", "get").mockReturnValueOnce(
        getBadgeListMock,
      );

      const badgeListResponse = await badgeStore.fetchBadgeList();

      expect(getBadgeListMock).toHaveBeenCalledTimes(1);
      expect(badgeListResponse).toEqual({
        status: "success",
        data: [],
      });
    });
  });
});
