import { afterEach, describe, expect, it, vi } from "vitest";

import { badgeService } from "~/api/badgeService";

const { mockSelect, mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockFrom = {
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  };
  return {
    mockSelect,
    mockFrom,
  };
});

vi.mock("~/api/utils/supabaseInit", () => ({
  default: () => mockFrom,
}));

function expectTotalBadgeQuery() {
  expect(mockFrom.from).toHaveBeenCalledTimes(1);
  expect(mockFrom.from).toHaveBeenCalledWith("badges");
  expect(mockSelect).toHaveBeenCalledTimes(1);
  expect(mockSelect).toHaveBeenCalledWith("badge_id", { count: "exact" });
}

describe("Badge services", () => {
  describe("countAllBadges", () => {
    afterEach(() => {
      mockSelect.mockClear();
      mockFrom.from.mockClear();
    });

    it("returns the total badges on success", async () => {
      mockSelect.mockReturnValueOnce({
        error: null,
        data: [],
        count: 15,
        status: 200,
        statusText: "OK",
      });

      const totalBadgeResponse = await badgeService.statistics.countAllBadges();

      expectTotalBadgeQuery();
      expect(totalBadgeResponse).toEqual({
        error: null,
        data: [],
        count: 15,
        status: 200,
        statusText: "OK",
      });
    });

    it("returns an error when the query fails", async () => {
      mockSelect.mockReturnValueOnce({
        error: {
          code: "InvalidToken",
          message: "Unknown key",
        },
        data: null,
        count: 0,
        status: 401,
        statusText: "Unauthorized",
      });

      const totalBadgeResponse = await badgeService.statistics.countAllBadges();

      expectTotalBadgeQuery();
      expect(totalBadgeResponse).toEqual({
        error: {
          code: "InvalidToken",
          message: "Unknown key",
        },
        data: null,
        count: 0,
        status: 401,
        statusText: "Unauthorized",
      });
    });

    it("returns undefined if select returns undefined", async () => {
      mockSelect.mockReturnValueOnce(undefined);

      const totalBadgeResponse = await badgeService.statistics.countAllBadges();

      expectTotalBadgeQuery();
      expect(totalBadgeResponse).toBeUndefined();
    });

    it("throws if select throws", async () => {
      mockSelect.mockImplementationOnce(() => {
        throw new Error("DB connection lost");
      });

      let error;
      try {
        await badgeService.statistics.countAllBadges();
      } catch (e) {
        error = e;
      }

      expectTotalBadgeQuery();
      expect(error).toBeInstanceOf(Error);
      expect((error as { message: string }).message).toBe("DB connection lost");
    });
  });
});
