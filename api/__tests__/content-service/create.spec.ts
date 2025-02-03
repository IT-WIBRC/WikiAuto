import { afterAll, describe, expect, it, vi } from "vitest";
import { contentService } from "../../contentService";
import { CONTENT_STATUS } from "~/api/types";

const mockCreateContent = vi.hoisted(() => ({
  insert: vi
    .fn()
    .mockImplementationOnce(() => ({
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
    }))
    .mockImplementationOnce(() => ({
      error: null,
      data: {},
    })),
}));

vi.mock("~/api/supabaseInit", () => ({
  default: () => {
    return {
      from: () => mockCreateContent,
    };
  },
}));

describe("Create content", () => {
  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
    vi.clearAllMocks();
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
    expect(mockCreateContent.insert).toHaveBeenCalledTimes(2);

    expect(mockCreateContent.insert).toHaveBeenCalledWith({
      title: "Title",
      explanation: "explanation",
      user_email: "user@gmail.com",
      image: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
    });

    expect(mockCreateContent.insert).toHaveBeenLastCalledWith([
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
    mockCreateContent.insert.mockRestore();
  });

  it("should return the `incomplete` status when the creation badges failed", async () => {
    mockCreateContent.insert
      .mockImplementationOnce(() => ({
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
      }))
      .mockImplementationOnce(() => ({
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
    expect(mockCreateContent.insert).toHaveBeenCalledTimes(2);

    expect(mockCreateContent.insert).toHaveBeenCalledWith({
      title: "Title",
      explanation: "explanation0",
      user_email: "user@gmail.com",
      image: "0.2541654.png",
      status: CONTENT_STATUS.VALIDATED,
    });

    expect(mockCreateContent.insert).toHaveBeenLastCalledWith([
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
    mockCreateContent.insert.mockRestore();
  });

  it("should return the `failed` status when the creation has failed", async () => {
    mockCreateContent.insert.mockImplementationOnce(() => ({
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
    expect(mockCreateContent.insert).toHaveBeenCalledTimes(1);

    expect(mockCreateContent.insert).toHaveBeenCalledWith({
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
    mockCreateContent.insert.mockRestore();
  });
});
