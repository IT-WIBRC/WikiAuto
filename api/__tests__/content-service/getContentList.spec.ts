import { afterAll, describe, expect, it, vi } from "vitest";
import { contentService } from "~/api/contentService";

const mockGetContentList = vi.hoisted(() => ({
  select: vi.fn(() => {
    return {
      error: null,
      data: [],
    };
  }),
}));

vi.mock("~/api/supabaseInit", () => ({
  default: () => {
    return {
      from: () => mockGetContentList,
    };
  },
}));

describe("Get content List", () => {
  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
  });

  it("should return an empty array when there is no content", async () => {
    const contentList = await contentService.getContentList();
    expect(mockGetContentList.select).toHaveBeenCalledTimes(1);
    expect(contentList).toEqual({
      error: null,
      data: [],
    });
    expect(mockGetContentList.select).toHaveBeenCalledWith(`
      content_id, status, title, user_email, updated_at,
      badges (
        name
      )
    `);
  });

  it("should return the content list on success", async () => {
    mockGetContentList.select.mockRestore();
    const result = [
      {
        content_id: "12345",
        status: "Validated",
        title: "My title",
        user_email: "email@email.com",
        badges: [
          {
            name: "badge 1",
          },
        ],
        updated_at: "2024-12-14 13:25:08"
      },
    ];
    mockGetContentList.select.mockImplementation(() => {
      return {
        error: null,
        data: result,
      };
    });
    const contentList = await contentService.getContentList();
    expect(mockGetContentList.select).toHaveBeenCalledTimes(1);
    expect(contentList).toEqual({
      error: null,
      data: result,
    });
    mockGetContentList.select.mockRestore();
  });

  it("should return an error when failed", async () => {
    mockGetContentList.select.mockRestore();
    mockGetContentList.select.mockImplementation(() => {
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
    expect(mockGetContentList.select).toHaveBeenCalledTimes(1);
    expect(contentList).toEqual({
      error: {
        code: "InvalidToken",
        message: "Unknown key",
      },
      data: null,
      count: 0,
    });
    mockGetContentList.select.mockRestore();
  });
});
