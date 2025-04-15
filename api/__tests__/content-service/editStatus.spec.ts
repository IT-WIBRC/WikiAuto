import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { contentService } from "~/api/contentService";
import { CONTENT_STATUS } from "../../types";

const mockEq = vi.fn(() => ({
  error: null,
  data: {},
}));

const mockUpdate = vi.fn(() => {
  return {
    eq: mockEq,
  };
});

const mockFrom = vi.hoisted(() => ({
  from: vi.fn(() => {
    return {
      update: mockUpdate,
    };
  }),
}));

vi.mock("~/api/supabaseInit", () => ({
  default: () => {
    return mockFrom;
  },
}));

describe("Content services", () => {
  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
  });

  afterEach(() => {
    mockFrom.from.mockRestore();
    mockUpdate.mockRestore();
    mockEq.mockRestore();
  });

  it("should return the awaited object success", async () => {
    const totalContentResponse = await contentService.editStatus(
      "VALIDATED",
      "132132",
    );

    expect(mockFrom.from).toHaveBeenCalledTimes(1);
    expect(mockFrom.from).toHaveBeenCalledWith("contents");

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledWith({
      status: CONTENT_STATUS.VALIDATED,
    });

    expect(mockEq).toHaveBeenCalledTimes(1);
    expect(mockEq).toHaveBeenCalledWith("content_id", "132132");
    expect(totalContentResponse).toEqual({
      error: null,
      data: {},
    });
  });

  it("should return the awaited objects on error", async () => {
    mockEq.mockImplementation(() => {
      return {
        error: {
          code: "InvalidToken",
          message: "Unknown key",
        },
        data: null,
        count: 0,
      };
    });
    const totalContentResponse = await contentService.editStatus(
      "VALIDATED",
      "132132",
    );

    expect(mockFrom.from).toHaveBeenCalledTimes(1);
    expect(mockFrom.from).toHaveBeenCalledWith("contents");

    expect(mockEq).toHaveBeenCalledTimes(1);
    expect(mockEq).toHaveBeenCalledWith("content_id", "132132");
    expect(totalContentResponse).toEqual({
      error: {
        code: "InvalidToken",
        message: "Unknown key",
      },
      data: null,
      count: 0,
    });
  });
});
