import { afterAll, describe, expect, it, vi } from "vitest";
import { contentService } from "~/api/contentService";

const mockSupabaseSelectEq = vi.hoisted(() => ({
  eq: vi.fn(() => ({
    error: null,
    data: [],
    count: 15,
  })),
}));

vi.mock("~/api/supabaseInit", () => ({
  default: () => {
    return {
      from: () => {
        return {
          select: () => mockSupabaseSelectEq,
        };
      },
    };
  },
}));

describe("Content services", () => {
  describe("Statistics (getTotalContentWithStatus)", () => {
    afterAll(() => {
      vi.doUnmock("~/api/supabaseInit");
    });

    describe("Case: Validated", () => {
      it("should return the total `validated` content on success", async () => {
        const totalContentResponse =
          await contentService.statistics.getTotalContentWithStatus(
            "VALIDATED",
          );
        expect(mockSupabaseSelectEq.eq).toHaveBeenCalledTimes(1);
        expect(totalContentResponse).toEqual({
          error: null,
          data: [],
          count: 15,
        });
        mockSupabaseSelectEq.eq.mockRestore();
      });

      it("should return an error when the total `validated` content failed", async () => {
        mockSupabaseSelectEq.eq.mockImplementation(() => {
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
        expect(mockSupabaseSelectEq.eq).toHaveBeenCalledTimes(1);
        expect(totalContentResponse).toEqual({
          error: {
            code: "InvalidToken",
            message: "Unknown key",
          },
          data: null,
          count: 0,
        });
        mockSupabaseSelectEq.eq.mockRestore();
      });
    });
  });
});
