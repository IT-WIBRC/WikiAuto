import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { contentService } from "~/api/contentService";

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

describe("Get content List", () => {
  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
  });

  afterEach(() => {
    mockSelect.mockRestore();
    mockFrom.from.mockRestore();
  });

  it("should return an empty array when there is no content", async () => {
    const contentList = await contentService.getContentList();

    expect(mockFrom.from).toHaveBeenCalledTimes(1);
    expect(mockFrom.from).toHaveBeenCalledWith("contents");

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockSelect).toHaveBeenCalledWith(`
      content_id, status, title, user_email, updated_at, image, created_at, explanation,
      badges (
        name,
        badge_id,
        description
      )
    `);

    expect(contentList).toEqual({
      error: null,
      data: [],
    });
  });

  it("should return the content list on success", async () => {
    const result = [
      {
        content_id: "12345",
        status: "Validated",
        title: "My title",
        user_email: "email@email.com",
        badges: [
          {
            name: "badge-service 1",
          },
        ],
        updated_at: "2024-12-14 13:25:08",
      },
    ];
    mockSelect.mockImplementation(() => {
      return {
        error: null,
        data: result,
      };
    });
    const contentList = await contentService.getContentList();

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(contentList).toEqual({
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
    const contentList = await contentService.getContentList();

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(contentList).toEqual({
      error: {
        code: "InvalidToken",
        message: "Unknown key",
      },
      data: null,
      count: 0,
    });
  });
});
