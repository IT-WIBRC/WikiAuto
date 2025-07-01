import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { CONTENT_STATUS } from "~/api";
import { contentService } from "../../contentService";

const fullBadge = (
  id: string,
  name = "",
  created_at: string | null = null,
  description: string | null = null,
  updated_at: string | null = null,
) => ({
  badge_id: id,
  created_at,
  description,
  name,
  updated_at,
});

const { mockSingle, mockLimit, mockSelect, mockUpsert, mockIn, mockFrom } =
  vi.hoisted(() => {
    const mockSingle = vi.fn();
    const mockLimit = vi.fn(() => ({
      single: mockSingle,
    }));
    const mockIn = vi.fn();
    const mockSelect = vi.fn(() => ({
      limit: mockLimit,
      in: mockIn,
    }));
    const mockUpsert = vi.fn();
    const mockFrom = {
      from: vi.fn((table: string) => {
        if (table === "badges") {
          return { select: mockSelect };
        }
        if (table === "contents") {
          return {
            upsert: mockUpsert,
            select: mockSelect,
          };
        }
        if (table === "content_badges") {
          return { upsert: mockUpsert };
        }
        return {};
      }),
    };
    return {
      mockSingle,
      mockLimit,
      mockSelect,
      mockUpsert,
      mockIn,
      mockFrom,
    };
  });

vi.mock("~/api/utils/supabaseInit", () => ({
  default: () => mockFrom,
}));

describe("Edit content service", () => {
  afterAll(() => {
    vi.doUnmock("~/api/utils/supabaseInit");
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockFrom.from.mockClear();
    mockUpsert.mockClear();
    mockSelect.mockClear();
    mockLimit.mockClear();
    mockSingle.mockClear();
    mockIn.mockClear();
  });

  it("returns a PostgREST success response when all badges exist, content is edited, and badge linking succeeds", async () => {
    mockIn.mockReturnValueOnce({
      data: [{ badge_id: "123546" }, { badge_id: "1235468" }],
      error: null,
    });
    mockUpsert.mockReturnValueOnce({
      select: mockSelect,
    });
    mockSelect.mockReturnValueOnce({
      limit: mockLimit,
      in: mockIn,
    });
    mockLimit.mockReturnValueOnce({
      single: mockSingle,
    });
    mockSingle.mockReturnValueOnce({
      error: null,
      data: { content_id: "1324165498" },
    });
    mockUpsert.mockReturnValueOnce({
      error: null,
      data: {},
    });

    const response = await contentService.edit({
      title: "Title",
      explanation: "explanation",
      badges: [fullBadge("123546"), fullBadge("1235468")],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
      userEmail: "user@gmail.com",
      id: "98745611384174184",
    });

    expect(mockFrom.from).toHaveBeenCalledWith("badges");
    expect(mockFrom.from).toHaveBeenCalledWith("contents");
    expect(mockFrom.from).toHaveBeenCalledWith("content_badges");
    expect(mockUpsert).toHaveBeenCalledWith({
      content_id: "98745611384174184",
      title: "Title",
      explanation: "explanation",
      user_email: "user@gmail.com",
      image: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
    });
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
    expect(response).toMatchObject({
      error: null,
      data: { content_id: "1324165498" },
      status: 200,
      statusText: "OK",
    });
  });

  it("returns a PostgREST foreign key error if some badges do not exist", async () => {
    mockIn.mockReturnValueOnce({
      data: [{ badge_id: "123546" }],
      error: null,
    });

    const response = await contentService.edit({
      title: "Title",
      explanation: "explanation",
      badges: [fullBadge("123546"), fullBadge("1235468")],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
      userEmail: "user@gmail.com",
      id: "98745611384174184",
    });

    expect(response.error).toMatchObject({
      code: "23503",
      message: expect.stringContaining("violates foreign key constraint"),
      details: expect.stringContaining("1235468"),
      hint: "",
    });
    expect(response.status).toBe(409);
    expect(response.statusText).toBe("Conflict");
    expect(response.data).toBeNull();
  });

  it("returns a PostgREST error if badge existence check fails", async () => {
    mockIn.mockReturnValueOnce({
      data: null,
      error: {
        code: "400",
        message: "DB error",
        details: "details",
        hint: "",
      },
    });

    const response = await contentService.edit({
      title: "Title",
      explanation: "explanation",
      badges: [fullBadge("123546")],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
      userEmail: "user@gmail.com",
      id: "98745611384174184",
    });

    expect(response.error).toMatchObject({
      code: "400",
      message: "DB error",
      details: "details",
      hint: "",
    });
    expect(response.status).toBe(400);
    expect(response.statusText).toBe("Bad Request");
    expect(response.data).toBeNull();
  });

  it("returns a PostgREST error if content edition fails", async () => {
    mockIn.mockReturnValueOnce({
      data: [{ badge_id: "123546" }],
      error: null,
    });
    mockUpsert.mockReturnValueOnce({
      select: mockSelect,
    });
    mockSelect.mockReturnValueOnce({
      limit: mockLimit,
      in: mockIn,
    });
    mockLimit.mockReturnValueOnce({
      single: mockSingle,
    });
    mockSingle.mockReturnValueOnce({
      error: {
        code: "InvalidToken",
        message: "Unknown key",
        details: "details",
        hint: "",
      },
      data: null,
    });

    const response = await contentService.edit({
      title: "Title",
      explanation: "explanation1",
      badges: [fullBadge("123546")],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.VALIDATED,
      userEmail: "user@gmail.com",
      id: "56478931254",
    });

    expect(response.error).toMatchObject({
      code: "InvalidToken",
      message: "Unknown key",
      details: "details",
      hint: "",
    });
    expect(response.data).toBeNull();
  });

  it("returns a PostgREST error if badge linking fails after content edition", async () => {
    mockIn.mockReturnValueOnce({
      data: [{ badge_id: "123546" }],
      error: null,
    });
    mockUpsert.mockReturnValueOnce({
      select: mockSelect,
    });
    mockSelect.mockReturnValueOnce({
      limit: mockLimit,
      in: mockIn,
    });
    mockLimit.mockReturnValueOnce({
      single: mockSingle,
    });
    mockSingle.mockReturnValueOnce({
      error: null,
      data: { content_id: "1324165498" },
    });
    mockUpsert.mockReturnValueOnce({
      error: {
        code: "InvalidToken",
        message: "Unknown key",
        details: "details",
        hint: "",
      },
      data: null,
    });

    const response = await contentService.edit({
      title: "Title",
      explanation: "explanation0",
      badges: [fullBadge("123546")],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.VALIDATED,
      userEmail: "user@gmail.com",
      id: "56874165415",
    });

    expect(response.error).toMatchObject({
      code: "InvalidToken",
      message: "Unknown key",
      details: "details",
      hint: "",
    });
    expect(response.data).toBeNull();
  });

  it("returns a PostgREST not-null error if no badges are provided", async () => {
    const response = await contentService.edit({
      title: "Title",
      explanation: "explanation4",
      badges: [],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
      userEmail: "user@gmail.com",
      id: "56478931254",
    });

    expect(response.error).toMatchObject({
      code: "23502",
      message: expect.stringContaining("not-null constraint"),
      details: "No badges provided.",
      hint: "",
    });
    expect(response.status).toBe(400);
    expect(response.statusText).toBe("Bad Request");
    expect(response.data).toBeNull();
  });

  it("throws if content upsert throws an exception", async () => {
    mockIn.mockReturnValueOnce({
      data: [{ badge_id: "123546" }],
      error: null,
    });
    mockUpsert.mockImplementationOnce(() => {
      throw new Error("DB connection lost");
    });

    const payload = {
      title: "Title",
      explanation: "explanation2",
      badges: [fullBadge("123546", "Badge1")],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
      userEmail: "user@gmail.com",
      id: "56478931254",
    };

    let error: unknown;
    try {
      await contentService.edit(payload);
    } catch (e) {
      error = e;
    }

    expect(mockFrom.from).toHaveBeenCalledWith("contents");
    expect(error).toBeInstanceOf(Error);
    expect((error as { message: string }).message).toBe("DB connection lost");
  });

  it("throws if badge upsert throws an exception", async () => {
    mockIn.mockReturnValueOnce({
      data: [{ badge_id: "123546" }],
      error: null,
    });
    mockUpsert.mockReturnValueOnce({
      select: mockSelect,
    });
    mockSelect.mockReturnValueOnce({
      limit: mockLimit,
      in: mockIn,
    });
    mockLimit.mockReturnValueOnce({
      single: mockSingle,
    });
    mockSingle.mockReturnValueOnce({
      error: null,
      data: { content_id: "1324165498" },
    });
    mockUpsert.mockImplementationOnce(() => {
      throw Error("Upsert failed");
    });

    const payload = {
      title: "Title",
      explanation: "explanation3",
      badges: [fullBadge("123546", "Badge1")],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
      userEmail: "user@gmail.com",
      id: "56478931254",
    };

    let error: unknown;
    try {
      await contentService.edit(payload);
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as { message: string }).message).toBe("Upsert failed");
  });
});
