import { afterEach, describe, expect, it, vi } from "vitest";
import { badgeService } from "~/api/badgeService";

const { mockSelect, mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
  }));
  return {
    mockSelect,
    mockFrom,
  };
});

vi.mock("~/api/utils/supabaseInit", () => ({
  default: () => ({
    from: mockFrom,
  }),
}));

function expectBadgeQuery() {
  expect(mockFrom).toHaveBeenCalledTimes(1);
  expect(mockFrom).toHaveBeenCalledWith("badges");
  expect(mockSelect).toHaveBeenCalledTimes(1);
  expect(mockSelect).toHaveBeenCalledWith("badge_id, name");
}

describe("Get Badge List for options", () => {
  afterEach(() => {
    mockSelect.mockClear();
    mockFrom.mockClear();
  });

  it("returns an empty array when there are no badges", async () => {
    mockSelect.mockReturnValueOnce({
      error: null,
      data: [],
      count: null,
      status: 200,
      statusText: "OK",
    });

    const badgeList = await badgeService.getBadgeListForOptions();

    expectBadgeQuery();
    expect(badgeList).toEqual({
      error: null,
      data: [],
      count: null,
      status: 200,
      statusText: "OK",
    });
  });

  it("returns the badge list for option on success", async () => {
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
    mockSelect.mockReturnValueOnce({
      error: null,
      data: result,
      count: null,
      status: 200,
      statusText: "OK",
    });

    const badgeList = await badgeService.getBadgeListForOptions();

    expectBadgeQuery();
    expect(badgeList).toEqual({
      error: null,
      data: result,
      count: null,
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
      count: null,
      status: 401,
      statusText: "Unauthorized",
    });

    const badgeList = await badgeService.getBadgeListForOptions();

    expectBadgeQuery();
    expect(badgeList).toEqual({
      error: {
        code: "InvalidToken",
        message: "Unknown key",
      },
      data: null,
      count: null,
      status: 401,
      statusText: "Unauthorized",
    });
  });

  it("returns a single badge in the list if only one badge exists", async () => {
    const singleBadge = [
      {
        badge_id: "abc",
        name: "Unique Badge",
      },
    ];
    mockSelect.mockReturnValueOnce({
      error: null,
      data: singleBadge,
      count: 1,
      status: 200,
      statusText: "OK",
    });

    const badgeList = await badgeService.getBadgeListForOptions();

    expectBadgeQuery();
    expect(badgeList).toEqual({
      error: null,
      data: singleBadge,
      count: 1,
      status: 200,
      statusText: "OK",
    });
  });

  it("returns null data and error if the select returns undefined", async () => {
    mockSelect.mockReturnValueOnce(undefined);

    const badgeList = await badgeService.getBadgeListForOptions();

    expectBadgeQuery();
    expect(badgeList).toBeUndefined();
  });

  it("returns an error if select throws an exception", async () => {
    mockSelect.mockImplementationOnce(() => {
      throw new Error("Database connection lost");
    });

    let error;
    try {
      await badgeService.getBadgeListForOptions();
    } catch (e) {
      error = e;
    }

    expectBadgeQuery();
    expect(error).toBeInstanceOf(Error);
    expect((error as { message: string }).message).toBe(
      "Database connection lost",
    );
  });
});
