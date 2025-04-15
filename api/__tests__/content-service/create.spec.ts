import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { contentService } from "../../contentService";
import { CONTENT_STATUS } from "~/api/types";

const mockSingle = vi.fn(() => {
  return {
    error: null,
    data: {
      content_id: "1324165498",
    },
  };
});

const mockLimit = vi.fn(() => ({
  single: mockSingle,
}));

const mockSelect = vi.fn(() => ({
  limit: mockLimit,
}));

const mockInsert = vi.fn().mockImplementationOnce(() => ({
  select: mockSelect,
}));

const mockUpsert = vi.fn().mockImplementationOnce(() => ({
  error: null,
  data: {},
}));

const mockFrom = vi.hoisted(() => ({
  from: vi.fn(() => {
    return {
      insert: mockInsert,
      upsert: mockUpsert,
    };
  }),
}));

vi.mock("~/api/supabaseInit", () => ({
  default: () => {
    return mockFrom;
  },
}));

describe("Create content", () => {
  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockFrom.from.mockRestore();
    mockInsert.mockRestore();
    mockUpsert.mockRestore();
    mockSelect.mockRestore();
    mockLimit.mockRestore();
    mockSingle.mockRestore();
  });

  it("should return the `completed` status when the creation is successful", async () => {
    const badgeResponse = await contentService.create(
      {
        title: "Title",
        explanation: "explanation",
        badges: [{ badge_id: "123546" }, { badge_id: "1235468" }],
        illustration: "0.2541654.png",
        status: CONTENT_STATUS.PENDING,
      },
      "user@gmail.com",
    );

    expect(mockFrom.from).toHaveBeenCalledTimes(2);
    expect(mockFrom.from).toHaveBeenCalledWith("contents");

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith({
      title: "Title",
      explanation: "explanation",
      user_email: "user@gmail.com",
      image: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
    });

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockSelect).toHaveBeenCalledWith("content_id");

    expect(mockSingle).toHaveBeenCalledTimes(1);
    expect(mockSingle).toHaveBeenCalledWith();

    expect(mockLimit).toHaveBeenCalledTimes(1);
    expect(mockLimit).toHaveBeenCalledWith(1);

    expect(mockUpsert).toHaveBeenCalledTimes(1);
    expect(mockUpsert).toHaveBeenLastCalledWith([
      {
        badge_id: "123546",
        content_id: "1324165498",
      },
      {
        badge_id: "1235468",
        content_id: "1324165498",
      },
    ]);

    expect(badgeResponse).toEqual({
      status: "completed",
    });
  });

  it("should return the `incomplete` status when the creation badges failed", async () => {
    mockInsert.mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => ({
          single: vi.fn(() => {
            return {
              error: null,
              data: {
                content_id: "1324165498",
              },
            };
          }),
        })),
      })),
    }));

    mockUpsert.mockImplementationOnce(() => ({
      error: {
        code: "InvalidToken",
        message: "Unknown key",
      },
      data: null,
    }));

    const badgeResponse = await contentService.create(
      {
        title: "Title",
        explanation: "explanation0",
        badges: [{ badge_id: "123546" }],
        illustration: "0.2541654.png",
        status: CONTENT_STATUS.VALIDATED,
      },
      "user@gmail.com",
    );
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith({
      title: "Title",
      explanation: "explanation0",
      user_email: "user@gmail.com",
      image: "0.2541654.png",
      status: CONTENT_STATUS.VALIDATED,
    });

    expect(mockUpsert).toHaveBeenCalledTimes(1);
    expect(mockUpsert).toHaveBeenLastCalledWith([
      {
        badge_id: "123546",
        content_id: "1324165498",
      },
    ]);

    expect(badgeResponse).toEqual({
      status: "incomplete",
      error: {
        code: "InvalidToken",
        message: "Unknown key",
      },
    });
  });

  it("should return the `failed` status when the creation has failed", async () => {
    mockInsert.mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => ({
          single: vi.fn(() => {
            return {
              error: {
                code: "InvalidToken",
                message: "Unknown key",
              },
              data: null,
            };
          }),
        })),
      })),
    }));

    const badgeResponse = await contentService.create(
      {
        title: "Title",
        explanation: "explanation1",
        badges: [{ badge_id: "123546" }],
        illustration: "0.2541654.png",
        status: CONTENT_STATUS.VALIDATED,
      },
      "user@gmail.com",
    );
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith({
      title: "Title",
      explanation: "explanation1",
      user_email: "user@gmail.com",
      image: "0.2541654.png",
      status: CONTENT_STATUS.VALIDATED,
    });

    expect(badgeResponse).toEqual({
      status: "failed",
      error: {
        code: "InvalidToken",
        message: "Unknown key",
      },
    });
  });
});
