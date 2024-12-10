import { afterAll, describe, expect, it, vi } from "vitest";
import { contentService } from "~/api/contentService";

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

describe("Content services", () => {
  describe("Statistics (getTotalContent)", () => {
    afterAll(() => {
      vi.doUnmock("~/api/supabaseInit");
    });

    it("should return the total content on success", async () => {
      const totalContentResponse =
        await contentService.statistics.getTotalContent();
      expect(mockSupabaseSelect.select).toHaveBeenCalledTimes(1);
      expect(totalContentResponse).toEqual({
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
      const totalContentResponse =
        await contentService.statistics.getTotalContent();
      expect(mockSupabaseSelect.select).toHaveBeenCalledTimes(1);
      expect(totalContentResponse).toEqual({
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
