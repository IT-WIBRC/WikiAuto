import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { badgeService } from "~/api/badgeService";

const mockSelect = vi.fn(() => {
  return {
    error: null,
    data: [],
    count: 15,
  };
});

const mockFrom = vi.hoisted(() => ({
  from: vi.fn(() => {
    return {
      select: mockSelect,
    };
  }),
}));

vi.mock("~/api/supabaseInit", () => ({
  default: () => {
    return mockFrom;
  },
}));

describe("Badge services", () => {
  describe("getTotalBadges", () => {
    afterAll(() => {
      vi.doUnmock("~/api/supabaseInit");
    });

    afterEach(() => {
      mockSelect.mockRestore();
      mockFrom.from.mockRestore();
    });

    it("should return the total badges on success", async () => {
      const totalBadgeResponse = await badgeService.statistics.getTotalBadge();

      expect(mockFrom.from).toHaveBeenCalledTimes(1);
      expect(mockFrom.from).toHaveBeenCalledWith("badges");

      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(mockSelect).toHaveBeenCalledWith("badge_id", {
        count: "exact",
      });

      expect(totalBadgeResponse).toEqual({
        error: null,
        data: [],
        count: 15,
      });
    });

    it("should return an error when failed", async () => {
      mockSelect.mockImplementation(() => {
        return {
          error: {
            code: "InvalidToken",
            message: "Unknown key",
          },
          data: null,
          count: 0,
        };
      });
      const totalBadgeResponse = await badgeService.statistics.getTotalBadge();
      expect(mockFrom.from).toHaveBeenCalledTimes(1);
      expect(mockFrom.from).toHaveBeenCalledWith("badges");

      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(mockSelect).toHaveBeenCalledWith("badge_id", {
        count: "exact",
      });

      expect(totalBadgeResponse).toEqual({
        error: {
          code: "InvalidToken",
          message: "Unknown key",
        },
        data: null,
        count: 0,
      });
    });
  });
});
