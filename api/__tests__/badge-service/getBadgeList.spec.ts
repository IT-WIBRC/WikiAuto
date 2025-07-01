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

function expectBadgeListQuery() {
  expect(mockFrom.from).toHaveBeenCalledTimes(1);
  expect(mockFrom.from).toHaveBeenCalledWith("badges");
  expect(mockSelect).toHaveBeenCalledTimes(1);
  expect(mockSelect).toHaveBeenCalledWith("*");
}

describe("Get Badge List", () => {
  afterEach(() => {
    mockSelect.mockClear();
    mockFrom.from.mockClear();
  });

  it("returns an empty array when there are no badges", async () => {
    mockSelect.mockReturnValueOnce({
      error: null,
      data: [],
      count: null,
      status: 200,
      statusText: "OK",
    });

    const badgeListResponse = await badgeService.getBadgeList();

    expectBadgeListQuery();
    expect(badgeListResponse).toEqual({
      error: null,
      data: [],
      count: null,
      status: 200,
      statusText: "OK",
    });
  });

  it("returns the badge list on success", async () => {
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
    mockSelect.mockReturnValueOnce({
      error: null,
      data: result,
      count: 2,
      status: 200,
      statusText: "OK",
    });

    const badgeListResponse = await badgeService.getBadgeList();

    expectBadgeListQuery();
    expect(badgeListResponse).toEqual({
      error: null,
      data: result,
      count: 2,
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

    const badgeListResponse = await badgeService.getBadgeList();

    expectBadgeListQuery();
    expect(badgeListResponse).toEqual({
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

    const badgeListResponse = await badgeService.getBadgeList();

    expectBadgeListQuery();
    expect(badgeListResponse).toBeUndefined();
  });

  it("throws if select throws", async () => {
    mockSelect.mockImplementationOnce(() => {
      throw new Error("DB connection lost");
    });

    let error;
    try {
      await badgeService.getBadgeList();
    } catch (e) {
      error = e;
    }

    expectBadgeListQuery();
    expect(error).toBeInstanceOf(Error);
    expect((error as { message: string }).message).toBe("DB connection lost");
  });
});
