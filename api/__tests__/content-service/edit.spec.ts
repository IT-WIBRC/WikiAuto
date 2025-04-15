import { describe, afterAll, expect, it, vi, afterEach } from "vitest";
import { CONTENT_STATUS } from "~/api/types";
import { contentService } from "../../contentService";

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

const mockUpsert = vi
  .fn()
  .mockImplementationOnce(() => ({
    select: mockSelect,
  }))
  .mockImplementationOnce(() => ({
    error: null,
    data: {},
  }));

const mockFrom = vi.hoisted(() => ({
  from: vi.fn(() => {
    return {
      upsert: mockUpsert,
    };
  }),
}));

vi.mock("~/api/supabaseInit", () => ({
  default: () => {
    return mockFrom;
  },
}));

describe("Edit content", () => {
  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockFrom.from.mockRestore();
    mockUpsert.mockRestore();
    mockSelect.mockRestore();
    mockLimit.mockRestore();
    mockSingle.mockRestore();
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

    expect(mockFrom.from).toHaveBeenCalledTimes(2);
    expect(mockFrom.from).toHaveBeenCalledWith("contents");

    expect(mockUpsert).toHaveBeenCalledTimes(2);
    expect(mockUpsert).toHaveBeenCalledWith({
      title: "Title",
      explanation: "explanation",
      user_email: "user@gmail.com",
      image: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
      content_id: "98745611384174184",
    });

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockSelect).toHaveBeenCalledWith("content_id");

    expect(mockSingle).toHaveBeenCalledTimes(1);
    expect(mockSingle).toHaveBeenCalledWith();

    expect(mockLimit).toHaveBeenCalledTimes(1);
    expect(mockLimit).toHaveBeenCalledWith(1);

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

  it("should return the `incomplete` status when the edition badges failed", async () => {
    mockUpsert
      .mockImplementationOnce(() => ({
        select: mockSelect,
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

    expect(mockUpsert).toHaveBeenCalledTimes(2);
    expect(mockUpsert).toHaveBeenCalledWith({
      title: "Title",
      explanation: "explanation0",
      user_email: "user@gmail.com",
      image: "0.2541654.png",
      status: CONTENT_STATUS.VALIDATED,
      content_id: "56874165415",
    });

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
    const mockSingle = vi.fn(() => {
      return {
        error: {
          code: "InvalidToken",
          message: "Unknown key",
        },
        data: null,
      };
    });

    const mockLimit = vi.fn(() => ({
      single: mockSingle,
    }));

    const mockSelect = vi.fn(() => ({
      limit: mockLimit,
    }));

    mockUpsert.mockImplementationOnce(() => ({
      select: mockSelect,
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
    expect(mockUpsert).toHaveBeenCalledTimes(1);

    expect(mockUpsert).toHaveBeenCalledWith({
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
  });
});
