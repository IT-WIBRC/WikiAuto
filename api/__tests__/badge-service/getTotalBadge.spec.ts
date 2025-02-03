import { afterAll, describe, expect, it, vi } from "vitest";
import { badgeService } from "~/api/badgeService";

const mockSupabaseSelect = vi.hoisted(() => ({
  select: vi.fn(() => {
    return {
      error: null,
      data: [],
      count: 15,
    };
  }),
}));

vi.mock("~/api/supabaseInit", () => ({
  default: () => {
    return {
      from: () => mockSupabaseSelect,
    };
  },
}));

describe("Badge services", () => {
  describe("getTotalBadges", () => {
    afterAll(() => {
      vi.doUnmock("~/api/supabaseInit");
    });

    it("should return the total badges on success", async () => {
      const totalBadgeResponse = await badgeService.statistics.getTotalBadge();
      expect(mockSupabaseSelect.select).toHaveBeenCalledTimes(1);
      expect(totalBadgeResponse).toEqual({
        error: null,
        data: [],
        count: 15,
      });
      mockSupabaseSelect.select.mockRestore();
    });

    it("should return an error when failed", async () => {
      mockSupabaseSelect.select.mockImplementation(() => {
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
      expect(mockSupabaseSelect.select).toHaveBeenCalledTimes(1);
      expect(totalBadgeResponse).toEqual({
        error: {
          code: "InvalidToken",
          message: "Unknown key",
        },
        data: null,
        count: 0,
      });
      mockSupabaseSelect.select.mockRestore();
    });
  });
});
