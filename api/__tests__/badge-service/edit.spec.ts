import { afterEach, describe, expect, it, vi } from "vitest";

import { badgeService } from "~/api/badgeService";

const { mockEq, mockUpdate, mockFrom } = vi.hoisted(() => {
  const mockEq = vi.fn();
  const mockUpdate = vi.fn(() => ({
    eq: mockEq,
  }));
  const mockFrom = {
    from: vi.fn(() => ({
      update: mockUpdate,
    })),
  };
  return {
    mockEq,
    mockUpdate,
    mockFrom,
  };
});

vi.mock("~/api/utils/supabaseInit", () => ({
  default: () => mockFrom,
}));

function expectBadgeEdit(id: string, name: string, description: string) {
  expect(mockFrom.from).toHaveBeenCalledTimes(1);
  expect(mockFrom.from).toHaveBeenCalledWith("badges");
  expect(mockUpdate).toHaveBeenCalledTimes(1);
  expect(mockUpdate).toHaveBeenCalledWith({
    name,
    description,
  });
  expect(mockEq).toHaveBeenCalledTimes(1);
  expect(mockEq).toHaveBeenCalledWith("badge_id", id);
}

describe("Edit Badge", () => {
  afterEach(() => {
    mockFrom.from.mockClear();
    mockUpdate.mockClear();
    mockEq.mockClear();
  });

  it("returns an empty array and no error when the edition succeeds", async () => {
    mockEq.mockReturnValueOnce({
      error: null,
      data: [],
      count: 1,
      status: 200,
      statusText: "OK",
    });

    const badgeResponse = await badgeService.edit(
      "12345",
      "name",
      "description",
    );

    expectBadgeEdit("12345", "name", "description");
    expect(badgeResponse).toEqual({
      error: null,
      data: [],
      count: 1,
      status: 200,
      statusText: "OK",
    });
  });

  it("returns an error when it fails", async () => {
    mockEq.mockReturnValueOnce({
      error: {
        code: "ReferenceError",
        message: "Policy error",
      },
      data: null,
      count: 0,
      status: 403,
      statusText: "Forbidden",
    });

    const badgeResponse = await badgeService.edit(
      "12345678",
      "name",
      "description",
    );

    expectBadgeEdit("12345678", "name", "description");
    expect(badgeResponse).toEqual({
      error: {
        code: "ReferenceError",
        message: "Policy error",
      },
      data: null,
      count: 0,
      status: 403,
      statusText: "Forbidden",
    });
  });

  it("returns the updated badge object if edit returns a badge", async () => {
    const badge = {
      badge_id: "1",
      name: "Badge",
      description: "desc",
    };
    mockEq.mockReturnValueOnce({
      error: null,
      data: [badge],
      count: 1,
      status: 200,
      statusText: "OK",
    });

    const badgeResponse = await badgeService.edit("1", "Badge", "desc");

    expectBadgeEdit("1", "Badge", "desc");
    expect(badgeResponse).toEqual({
      error: null,
      data: [badge],
      count: 1,
      status: 200,
      statusText: "OK",
    });
  });

  it("returns undefined if eq returns undefined", async () => {
    mockEq.mockReturnValueOnce(undefined);

    const badgeResponse = await badgeService.edit("1", "Badge", "desc");

    expectBadgeEdit("1", "Badge", "desc");
    expect(badgeResponse).toBeUndefined();
  });

  it("throws if eq throws", async () => {
    mockEq.mockImplementationOnce(() => {
      throw new Error("DB connection lost");
    });

    let error;
    try {
      await badgeService.edit("1", "Badge", "desc");
    } catch (e) {
      error = e;
    }

    expectBadgeEdit("1", "Badge", "desc");
    expect(error).toBeInstanceOf(Error);
    expect((error as { message: string }).message).toBe("DB connection lost");
  });
});
