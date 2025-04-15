import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { badgeService } from "~/api/badgeService";

const mockInsert = vi.fn(() => {
  return {
    error: null,
    data: [],
  };
});

const mockFrom = vi.hoisted(() => ({
  from: vi.fn(() => {
    return {
      insert: mockInsert,
    };
  }),
}));

vi.mock("~/api/supabaseInit", () => ({
  default: () => {
    return mockFrom;
  },
}));

describe("Create Badge", () => {
  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
  });

  afterEach(() => {
    mockInsert.mockRestore();
    mockFrom.from.mockRestore();
  });

  it("should return an empty array when the creation succeed", async () => {
    const badgeCreationResponse = await badgeService.create(
      "name",
      "description",
    );

    expect(mockFrom.from).toHaveBeenCalledTimes(1);
    expect(mockFrom.from).toHaveBeenCalledWith("badges");

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith({
      name: "name",
      description: "description",
    });

    expect(badgeCreationResponse).toEqual({
      error: null,
      data: [],
    });
  });

  it("should return an error when it failed", async () => {
    mockInsert.mockImplementation(() => {
      return {
        error: {
          code: "ReferenceError",
          message: "Policy error",
        },
        data: null,
      };
    });
    const badgeCreationResponse = await badgeService.create(
      "name",
      "description",
    );

    expect(mockFrom.from).toHaveBeenCalledTimes(1);
    expect(mockFrom.from).toHaveBeenCalledWith("badges");

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith({
      name: "name",
      description: "description",
    });

    expect(badgeCreationResponse).toEqual({
      error: {
        code: "ReferenceError",
        message: "Policy error",
      },
      data: null,
    });
  });
});
