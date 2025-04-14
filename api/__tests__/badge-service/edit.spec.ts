import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { badgeService } from "~/api/badgeService";

const mockEditBadgeEq = vi.fn(() => {
  return {
    error: null,
    data: [],
  };
});

const mockEditBadgeUpdate = vi.fn(() => ({
  eq: mockEditBadgeEq,
}));

const mockEditBadge = vi.hoisted(() => ({
  from: vi.fn(() => {
    return {
      update: mockEditBadgeUpdate,
    };
  }),
}));

vi.mock("~/api/supabaseInit", () => ({
  default: () => {
    return mockEditBadge;
  },
}));

describe("Edit Badge", () => {
  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
  });

  afterEach(() => {
    mockEditBadge.from.mockRestore();
    mockEditBadgeUpdate.mockRestore();
    mockEditBadgeEq.mockRestore();
  });

  it("should return an empty array when the edition succeed", async () => {
    const badgeResponse = await badgeService.edit(
      "12345",
      "name",
      "description",
    );

    expect(mockEditBadge.from).toHaveBeenCalledTimes(1);
    expect(mockEditBadge.from).toHaveBeenCalledWith("badges");

    expect(mockEditBadgeUpdate).toHaveBeenCalledTimes(1);
    expect(mockEditBadgeUpdate).toHaveBeenCalledWith({
      name: "name",
      description: "description",
    });

    expect(mockEditBadgeEq).toHaveBeenCalledTimes(1);
    expect(mockEditBadgeEq).toHaveBeenCalledWith("badge_id", "12345");
    expect(badgeResponse).toEqual({
      error: null,
      data: [],
    });
  });

  it("should return an error when it fails", async () => {
    mockEditBadgeEq.mockImplementation(() => {
      return {
        error: {
          code: "ReferenceError",
          message: "Policy error",
        },
        data: null,
      };
    });
    const badgeList = await badgeService.edit(
      "12345678",
      "name",
      "description",
    );

    expect(mockEditBadgeUpdate).toHaveBeenCalledTimes(1);
    expect(mockEditBadgeUpdate).toHaveBeenCalledWith({
      name: "name",
      description: "description",
    });

    expect(mockEditBadge.from).toHaveBeenCalledTimes(1);
    expect(mockEditBadge.from).toHaveBeenCalledWith("badges");

    expect(mockEditBadgeEq).toHaveBeenCalledTimes(1);
    expect(mockEditBadgeEq).toHaveBeenCalledWith("badge_id", "12345678");

    expect(badgeList).toEqual({
      error: {
        code: "ReferenceError",
        message: "Policy error",
      },
      data: null,
    });
  });
});
