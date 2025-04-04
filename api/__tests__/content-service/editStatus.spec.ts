import { afterAll, describe, expect, it, vi } from "vitest";
import { contentService } from "~/api/contentService";

const mockSupabaseUpdateEq = vi.hoisted(() => ({
  eq: vi.fn(() => ({
    error: null,
    data: {},
  })),
}));

vi.mock("~/api/supabaseInit", () => ({
  default: () => {
    return {
      from: () => {
        return {
          update: () => mockSupabaseUpdateEq,
        };
      },
    };
  },
}));

describe("Content services", () => {
  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
  });

  it("should return the awaited object success", async () => {
    const totalContentResponse = await contentService.editStatus(
      "VALIDATED",
      "132132",
    );
    expect(mockSupabaseUpdateEq.eq).toHaveBeenCalledTimes(1);
    expect(mockSupabaseUpdateEq.eq).toHaveBeenCalledWith(
      "content_id",
      "132132",
    );
    expect(totalContentResponse).toEqual({
      error: null,
      data: {},
    });
    mockSupabaseUpdateEq.eq.mockRestore();
  });

  it("should return the awaited objects on error", async () => {
    mockSupabaseUpdateEq.eq.mockImplementation(() => {
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
    expect(mockSupabaseUpdateEq.eq).toHaveBeenCalledTimes(1);
    expect(mockSupabaseUpdateEq.eq).toHaveBeenCalledWith(
      "content_id",
      "132132",
    );
    expect(totalContentResponse).toEqual({
      error: {
        code: "InvalidToken",
        message: "Unknown key",
      },
      data: null,
      count: 0,
    });
    mockSupabaseUpdateEq.eq.mockRestore();
  });
});
