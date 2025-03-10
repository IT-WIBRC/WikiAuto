import { describe, afterAll, expect, it, vi } from "vitest";
import { CONTENT_STATUS } from "~/api/types";
import { contentService } from "../../contentService";

const mockEditContent = vi.hoisted(() => ({
  upsert: vi
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
      from: () => mockEditContent,
    };
  },
}));

describe("Edit content", () => {
  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
    vi.clearAllMocks();
  });

  it("should return the `completed` status when the edition is successful", async () => {
    const badgeResponse = await contentService.edit({
      title: "Title",
      explanation: "explanation",
      badges: [{ badge_id: "123546" }, { badge_id: "1235468" }],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
      userEmail: "user@gmail.com",
      id: "98745611384174184",
    });
    expect(mockEditContent.upsert).toHaveBeenCalledTimes(2);

    expect(mockEditContent.upsert).toHaveBeenCalledWith({
      title: "Title",
      explanation: "explanation",
      user_email: "user@gmail.com",
      image: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
      content_id: "98745611384174184",
    });

    expect(mockEditContent.upsert).toHaveBeenLastCalledWith([
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
    mockEditContent.upsert.mockRestore();
  });

  it("should return the `incomplete` status when the edition badges failed", async () => {
    mockEditContent.upsert
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

    const badgeResponse = await contentService.edit({
      title: "Title",
      explanation: "explanation0",
      badges: [{ badge_id: "123546" }],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.VALIDATED,
      userEmail: "user@gmail.com",
      id: "56874165415",
    });

    expect(mockEditContent.upsert).toHaveBeenCalledTimes(2);
    expect(mockEditContent.upsert).toHaveBeenCalledWith({
      title: "Title",
      explanation: "explanation0",
      user_email: "user@gmail.com",
      image: "0.2541654.png",
      status: CONTENT_STATUS.VALIDATED,
      content_id: "56874165415",
    });

    expect(mockEditContent.upsert).toHaveBeenLastCalledWith([
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
    mockEditContent.upsert.mockRestore();
  });

  it("should return the `failed` status when the creation has failed", async () => {
    mockEditContent.upsert.mockImplementationOnce(() => ({
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

    const badgeResponse = await contentService.edit({
      title: "Title",
      explanation: "explanation1",
      badges: [{ badge_id: "123546" }],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.VALIDATED,
      userEmail: "user@gmail.com",
      id: "56478931254",
    });
    expect(mockEditContent.upsert).toHaveBeenCalledTimes(1);

    expect(mockEditContent.upsert).toHaveBeenCalledWith({
      title: "Title",
      explanation: "explanation1",
      user_email: "user@gmail.com",
      image: "0.2541654.png",
      status: CONTENT_STATUS.VALIDATED,
      content_id: "56478931254",
    });

    expect(badgeResponse).toEqual({
      status: "failed",
      error: {
        code: "InvalidToken",
        message: "Unknown key",
      },
    });
    mockEditContent.upsert.mockRestore();
  });
});
