import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { contentService } from "~/api/contentService";
import { CONTENT_STATUS } from "~/api/types/content";

const mockEq = vi.fn();

const mockSelect = vi.fn(() => ({
  eq: mockEq,
}));

const mockFrom = vi.hoisted(() => ({
  from: vi.fn(() => ({
    select: mockSelect,
  })),
}));

vi.mock("~/api/utils/supabaseInit", () => ({
  default: () => mockFrom,
}));

describe("Content services", () => {
  describe("Statistics (getTotalContentWithStatus)", () => {
    afterAll(() => {
      vi.doUnmock("~/api/utils/supabaseInit");
    });

    afterEach(() => {
      mockFrom.from.mockClear();
      mockSelect.mockClear();
      mockEq.mockClear();
    });

    it("should return the total `validated` content on success", async () => {
      mockEq.mockReturnValueOnce({
        error: null,
        data: [],
        count: 105,
      });

      const totalContentResponse =
        await contentService.statistics.getTotalContentWithStatus("VALIDATED");

      expect(mockFrom.from).toHaveBeenCalledTimes(1);
      expect(mockFrom.from).toHaveBeenCalledWith("contents");

      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(mockSelect).toHaveBeenCalledWith("content_id, status", {
        count: "exact",
      });

      expect(mockEq).toHaveBeenCalledTimes(1);
      expect(mockEq).toHaveBeenCalledWith("status", CONTENT_STATUS.VALIDATED);

      expect(totalContentResponse).toEqual({
        error: null,
        data: [],
        count: 105,
      });
    });

    it("should return an error when the total `validated` content failed", async () => {
      mockEq.mockReturnValueOnce({
        error: {
          code: "InvalidToken",
          message: "Unknown key",
          details: "",
          hint: "",
        },
        data: null,
        count: 0,
      });

      const totalContentResponse =
        await contentService.statistics.getTotalContentWithStatus("VALIDATED");

      expect(mockEq).toHaveBeenCalledTimes(1);
      expect(mockEq).toHaveBeenCalledWith("status", CONTENT_STATUS.VALIDATED);

      expect(totalContentResponse).toEqual({
        error: {
          code: "InvalidToken",
          message: "Unknown key",
          details: "",
          hint: "",
        },
        data: null,
        count: 0,
      });
    });
  });
});
