import { afterEach, describe, expect, it, vi } from "vitest";

import { badgeService } from "~/api/badgeService";

const { mockInsert, mockFrom } = vi.hoisted(() => {
  const mockInsert = vi.fn();
  const mockFrom = {
    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  };
  return {
    mockInsert,
    mockFrom,
  };
});

vi.mock("~/api/utils/supabaseInit", () => ({
  default: () => mockFrom,
}));

function expectBadgeInsert(name: string, description: string) {
  expect(mockFrom.from).toHaveBeenCalledTimes(1);
  expect(mockFrom.from).toHaveBeenCalledWith("badges");
  expect(mockInsert).toHaveBeenCalledTimes(1);
  expect(mockInsert).toHaveBeenCalledWith({
    name,
    description,
  });
}

describe("Create Badge", () => {
  afterEach(() => {
    mockInsert.mockClear();
    mockFrom.from.mockClear();
  });

  it("returns an empty array and no error when creation succeeds", async () => {
    mockInsert.mockReturnValueOnce({
      error: null,
      data: [],
      count: null,
      status: 201,
      statusText: "Created",
    });

    const badgeCreationResponse = await badgeService.create(
      "name",
      "description",
    );

    expectBadgeInsert("name", "description");
    expect(badgeCreationResponse).toEqual({
      error: null,
      data: [],
      count: null,
      status: 201,
      statusText: "Created",
    });
  });

  it("returns an error when creation fails", async () => {
    mockInsert.mockReturnValueOnce({
      error: {
        code: "ReferenceError",
        message: "Policy error",
      },
      data: null,
      count: null,
      status: 403,
      statusText: "Forbidden",
    });

    const badgeCreationResponse = await badgeService.create(
      "name",
      "description",
    );

    expectBadgeInsert("name", "description");
    expect(badgeCreationResponse).toEqual({
      error: {
        code: "ReferenceError",
        message: "Policy error",
      },
      data: null,
      count: null,
      status: 403,
      statusText: "Forbidden",
    });
  });

  it("returns the correct response when insert returns a single badge object", async () => {
    const badge = {
      badge_id: "1",
      name: "Badge",
      description: "desc",
    };
    mockInsert.mockReturnValueOnce({
      error: null,
      data: [badge],
      count: 1,
      status: 201,
      statusText: "Created",
    });

    const badgeCreationResponse = await badgeService.create("Badge", "desc");

    expectBadgeInsert("Badge", "desc");
    expect(badgeCreationResponse).toEqual({
      error: null,
      data: [badge],
      count: 1,
      status: 201,
      statusText: "Created",
    });
  });

  it("returns undefined if insert returns undefined", async () => {
    mockInsert.mockReturnValueOnce(undefined);

    const badgeCreationResponse = await badgeService.create("Badge", "desc");

    expectBadgeInsert("Badge", "desc");
    expect(badgeCreationResponse).toBeUndefined();
  });

  it("throws if insert throws", async () => {
    mockInsert.mockImplementationOnce(() => {
      throw new Error("DB connection lost");
    });

    let error;
    try {
      await badgeService.create("Badge", "desc");
    } catch (e) {
      error = e;
    }

    expectBadgeInsert("Badge", "desc");
    expect(error).toBeInstanceOf(Error);
    expect((error as { message: string }).message).toBe("DB connection lost");
  });
});
