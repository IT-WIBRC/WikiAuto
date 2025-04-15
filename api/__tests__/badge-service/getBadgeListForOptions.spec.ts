import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { badgeService } from "~/api/badgeService";

const mockSelect = vi.fn(() => {
  return {
    error: null,
    data: [],
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

describe("Get Badge List for options", () => {
  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
  });

  afterEach(() => {
    mockSelect.mockRestore();
    mockFrom.from.mockRestore();
  });

  it("should return an empty array when there is no badge", async () => {
    const badgeList = await badgeService.getBadgeListForOptions();

    expect(mockFrom.from).toHaveBeenCalledTimes(1);
    expect(mockFrom.from).toHaveBeenCalledWith("badges");

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockSelect).toHaveBeenCalledWith("badge_id, name");

    expect(badgeList).toEqual({
      error: null,
      data: [],
    });
  });

  it("should return the badge list for option on success", async () => {
    const result = [
      {
        badge_id: "12345",
        name: "My title",
      },
      {
        badge_id: "123456",
        name: "My title0",
      },
    ];
    mockSelect.mockImplementation(() => {
      return {
        error: null,
        data: result,
      };
    });
    const badgeList = await badgeService.getBadgeListForOptions();
    expect(mockFrom.from).toHaveBeenCalledTimes(1);
    expect(mockFrom.from).toHaveBeenCalledWith("badges");

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockSelect).toHaveBeenCalledWith("badge_id, name");

    expect(badgeList).toEqual({
      error: null,
      data: result,
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
    const badgeList = await badgeService.getBadgeListForOptions();
    expect(mockFrom.from).toHaveBeenCalledTimes(1);
    expect(mockFrom.from).toHaveBeenCalledWith("badges");

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockSelect).toHaveBeenCalledWith("badge_id, name");

    expect(badgeList).toEqual({
      error: {
        code: "InvalidToken",
        message: "Unknown key",
      },
      data: null,
      count: 0,
    });
  });
});
