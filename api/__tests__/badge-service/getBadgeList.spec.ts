import { afterAll, describe, expect, it, vi } from "vitest";
import { badgeService } from "~/api/badgeService";

const mockGetBadgeList = vi.hoisted(() => ({
  select: vi.fn(() => {
    return {
      error: null,
      data: [],
    };
  }),
}));

vi.mock("~/api/supabaseInit", () => ({
  default: () => {
    return {
      from: () => mockGetBadgeList,
    };
  },
}));

describe("Get Badge List", () => {
  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
  });

  it("should return an empty array when there is no badge", async () => {
    const badgeList = await badgeService.getBadgeList();
    expect(mockGetBadgeList.select).toHaveBeenCalledTimes(1);
    expect(badgeList).toEqual({
      error: null,
      data: [],
    });
    expect(mockGetBadgeList.select).toHaveBeenCalledWith(
      "badge_id, name, description",
    );
  });

  it("should return the badge list for option on success", async () => {
    mockGetBadgeList.select.mockRestore();
    const result = [
      {
        badge_id: "12345",
        name: "My title",
        description: "My description",
      },
      {
        badge_id: "123456",
        name: "My title0",
        description: "My description 0",
      },
    ];
    mockGetBadgeList.select.mockImplementation(() => {
      return {
        error: null,
        data: result,
      };
    });
    const badgeList = await badgeService.getBadgeList();
    expect(mockGetBadgeList.select).toHaveBeenCalledTimes(1);
    expect(badgeList).toEqual({
      error: null,
      data: result,
    });
    mockGetBadgeList.select.mockRestore();
  });

  it("should return an error when failed", async () => {
    mockGetBadgeList.select.mockRestore();
    mockGetBadgeList.select.mockImplementation(() => {
      return {
        error: {
          code: "InvalidToken",
          message: "Unknown key",
        },
        data: null,
        count: 0,
      };
    });
    const badgeList = await badgeService.getBadgeList();
    expect(mockGetBadgeList.select).toHaveBeenCalledTimes(1);
    expect(badgeList).toEqual({
      error: {
        code: "InvalidToken",
        message: "Unknown key",
      },
      data: null,
      count: 0,
    });
    mockGetBadgeList.select.mockRestore();
  });
});
