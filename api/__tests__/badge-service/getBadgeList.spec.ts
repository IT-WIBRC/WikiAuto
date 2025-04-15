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

describe("Get Badge List", () => {
  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
  });

  afterEach(() => {
    mockSelect.mockRestore();
    mockFrom.from.mockRestore();
  });

  it("should return an empty array when there is no badge", async () => {
    const badgeListResponse = await badgeService.getBadgeList();

    expect(mockFrom.from).toHaveBeenCalledTimes(1);
    expect(mockFrom.from).toHaveBeenCalledWith("badges");

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockSelect).toHaveBeenCalledWith("*");

    expect(badgeListResponse).toEqual({
      error: null,
      data: [],
    });
  });

  it("should return the badge list for option on success", async () => {
    const result = [
      {
        badge_id: "12345",
        name: "My title",
        description: "My description",
        created_at: "2024-12-14 13:25:08",
        updated_at: "2024-02-14 13:25:08",
      },
      {
        badge_id: "123456",
        name: "My title0",
        description: "My description 0",
        created_at: "2025-03-20 18:25:08",
        updated_at: "2025-04-08 08:02:56",
      },
    ];
    mockSelect.mockImplementation(() => {
      return {
        error: null,
        data: result,
      };
    });
    const badgeListResponse = await badgeService.getBadgeList();

    expect(mockFrom.from).toHaveBeenCalledTimes(1);
    expect(mockFrom.from).toHaveBeenCalledWith("badges");

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockSelect).toHaveBeenCalledWith("*");

    expect(badgeListResponse).toEqual({
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
    const badgeListResponse = await badgeService.getBadgeList();
    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(badgeListResponse).toEqual({
      error: {
        code: "InvalidToken",
        message: "Unknown key",
      },
      data: null,
      count: 0,
    });
  });
});
