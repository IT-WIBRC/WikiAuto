import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { contentService } from "~/api/contentService";

const mockSelect = vi.fn(() => {
  return {
    error: null,
    data: [],
    count: 20,
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

describe("Content services", () => {
  describe("Statistics (getTotalContent)", () => {
    afterAll(() => {
      vi.doUnmock("~/api/supabaseInit");
    });

    afterEach(() => {
      mockSelect.mockRestore();
      mockFrom.from.mockRestore();
    });

    it("should return the total content on success", async () => {
      const totalContentResponse =
        await contentService.statistics.getTotalContent();

      expect(mockFrom.from).toHaveBeenCalledTimes(1);
      expect(mockFrom.from).toHaveBeenCalledWith("contents");

      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(mockSelect).toHaveBeenCalledWith("content_id", {
        count: "exact",
      });

      expect(totalContentResponse).toEqual({
        error: null,
        data: [],
        count: 20,
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
      const totalContentResponse =
        await contentService.statistics.getTotalContent();

      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(mockSelect).toHaveBeenCalledWith("content_id", {
        count: "exact",
      });

      expect(totalContentResponse).toEqual({
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
