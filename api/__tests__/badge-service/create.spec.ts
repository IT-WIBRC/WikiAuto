import { afterAll, describe, expect, it, vi } from "vitest";
import { badgeService } from "~/api/badgeService";

const mockCreateBadge = vi.hoisted(() => ({
  insert: vi.fn(() => {
    return {
      error: null,
      data: [],
    };
  }),
}));

vi.mock("~/api/supabaseInit", () => ({
  default: () => {
    return {
      from: () => mockCreateBadge,
    };
  },
}));

describe("Create Badge", () => {
  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
  });

  it("should return an empty array when the creation succeed", async () => {
    const badgeResponse = await badgeService.create("name", "description");
    expect(mockCreateBadge.insert).toHaveBeenCalledTimes(1);
    expect(badgeResponse).toEqual({
      error: null,
      data: [],
    });
    expect(mockCreateBadge.insert).toHaveBeenCalledWith({
      name: "name",
      description: "description",
    });
  });

  it("should return an error when it failed", async () => {
    mockCreateBadge.insert.mockRestore();
    mockCreateBadge.insert.mockImplementation(() => {
      return {
        error: {
          code: "ReferenceError",
          message: "Policy error",
        },
        data: null,
      };
    });
    const badgeList = await badgeService.create("name", "description");
    expect(mockCreateBadge.insert).toHaveBeenCalledTimes(1);
    expect(badgeList).toEqual({
      error: {
        code: "ReferenceError",
        message: "Policy error",
      },
      data: null,
    });
    mockCreateBadge.insert.mockRestore();
  });
});
