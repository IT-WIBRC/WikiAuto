import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { contentService } from "~/api/contentService";
import { CONTENT_STATUS } from "../../types";

const mockEq = vi.fn(() => {
  return {
    error: null,
    data: [],
    count: 105,
  };
});

const mockSelect = vi.fn(() => {
  return {
    eq: mockEq,
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
  describe("Statistics (getTotalContentWithStatus)", () => {
    afterAll(() => {
      vi.doUnmock("~/api/supabaseInit");
    });

    afterEach(() => {
      mockFrom.from.mockRestore();
      mockSelect.mockRestore();
      mockEq.mockRestore();
    });

    describe("Case: Validated", () => {
      it("should return the total `validated` content on success", async () => {
        const totalContentResponse =
          await contentService.statistics.getTotalContentWithStatus(
            "VALIDATED",
          );

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
        mockEq.mockImplementation(() => {
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
          await contentService.statistics.getTotalContentWithStatus(
            "VALIDATED",
          );

        expect(mockEq).toHaveBeenCalledTimes(1);
        expect(mockEq).toHaveBeenCalledWith("status", CONTENT_STATUS.VALIDATED);

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
});
