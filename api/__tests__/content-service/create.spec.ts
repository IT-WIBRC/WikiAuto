import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { contentService } from "../../contentService";
import { CONTENT_STATUS } from "~/api";
import type { ContentCreation } from "~/api/types/content";
import type { Badge } from "~/api/types/badge";

const fullBadge = (
  id: string,
  name = "Badge1",
  created_at: string | null = "",
  description: string | null = "",
  updated_at: string | null = "",
): Badge => ({
  badge_id: id,
  name,
  created_at,
  description,
  updated_at,
});

const {
  mockSingle,
  mockLimit,
  mockSelect,
  mockInsert,
  mockUpsert,
  mockIn,
  mockFrom,
} = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockLimit = vi.fn(() => ({
    single: mockSingle,
  }));
  const mockIn = vi.fn();
  const mockSelect = vi.fn(() => ({
    limit: mockLimit,
    in: mockIn,
  }));
  const mockInsert = vi.fn(() => ({
    select: mockSelect,
  }));
  const mockUpsert = vi.fn();
  const mockFrom = {
    from: vi.fn((table: string) => {
      if (table === "badges") {
        return { select: mockSelect };
      }
      if (table === "contents") {
        return {
          insert: mockInsert,
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
    mockInsert,
    mockUpsert,
    mockIn,
    mockFrom,
  };
});

vi.mock("~/api/utils/supabaseInit", () => ({
  default: () => mockFrom,
}));

type TestPayload = Omit<ContentCreation, "illustration"> & {
  illustration: string;
};

function expectContentInsert(payload: TestPayload, email: string) {
  expect(mockFrom.from).toHaveBeenCalledWith("contents");
  expect(mockInsert).toHaveBeenCalledWith({
    title: payload.title,
    explanation: payload.explanation,
    user_email: email,
    status: payload.status,
    image: payload.illustration,
  });
  expect(mockSelect).toHaveBeenCalledWith("content_id");
  expect(mockLimit).toHaveBeenCalledWith(1);
  expect(mockSingle).toHaveBeenCalled();
}

function expectBadgeUpsert(badges: Badge[], content_id: string) {
  expect(mockUpsert).toHaveBeenCalledWith(
    badges.map((b) => ({
      badge_id: b.badge_id,
      content_id,
    })),
  );
}

describe("Content creation service", () => {
  afterAll(() => {
    vi.doUnmock("~/api/utils/supabaseInit");
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockFrom.from.mockClear();
    mockInsert.mockClear();
    mockUpsert.mockClear();
    mockSelect.mockClear();
    mockLimit.mockClear();
    mockSingle.mockClear();
    mockIn.mockClear();
  });

  it("returns a PostgREST success response when all badges exist, content is created, and badge linking succeeds", async () => {
    mockIn.mockReturnValueOnce({
      data: [{ badge_id: "123546" }, { badge_id: "1235468" }],
      error: null,
    });
    mockInsert.mockReturnValueOnce({
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

    const payload: TestPayload = {
      title: "Title",
      explanation: "explanation",
      badges: [fullBadge("123546", "Badge1"), fullBadge("1235468", "Badge2")],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
    };
    const response = await contentService.create(payload, "user@gmail.com");

    expectContentInsert(payload, "user@gmail.com");
    expectBadgeUpsert(payload.badges, "1324165498");
    expect(response).toMatchObject({
      error: null,
      data: { content_id: "1324165498" },
      status: 201,
      statusText: "Created",
    });
  });

  it("returns a PostgREST foreign key error if some badges do not exist", async () => {
    mockIn.mockReturnValueOnce({
      data: [{ badge_id: "123546" }],
      error: null,
    });

    const payload: TestPayload = {
      title: "Title",
      explanation: "explanation",
      badges: [fullBadge("123546", "Badge1"), fullBadge("1235468", "Badge2")],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
    };
    const response = await contentService.create(payload, "user@gmail.com");

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

    const payload: TestPayload = {
      title: "Title",
      explanation: "explanation",
      badges: [fullBadge("123546", "Badge1")],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
    };
    const response = await contentService.create(payload, "user@gmail.com");

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

  it("returns a PostgREST error if content creation fails", async () => {
    mockIn.mockReturnValueOnce({
      data: [{ badge_id: "123546" }],
      error: null,
    });
    mockInsert.mockReturnValueOnce({
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

    const payload: TestPayload = {
      title: "Title",
      explanation: "explanation1",
      badges: [fullBadge("123546", "Badge1")],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.VALIDATED,
    };
    const response = await contentService.create(payload, "user@gmail.com");

    expectContentInsert(payload, "user@gmail.com");
    expect(response.error).toMatchObject({
      code: "InvalidToken",
      message: "Unknown key",
      details: "details",
      hint: "",
    });
    expect(response.data).toBeNull();
  });

  it("returns a PostgREST error if badge linking fails after content creation", async () => {
    mockIn.mockReturnValueOnce({
      data: [{ badge_id: "123546" }],
      error: null,
    });
    mockInsert.mockReturnValueOnce({
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

    const payload: TestPayload = {
      title: "Title",
      explanation: "explanation0",
      badges: [fullBadge("123546", "Badge1")],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.VALIDATED,
    };
    const response = await contentService.create(payload, "user@gmail.com");

    expectContentInsert(payload, "user@gmail.com");
    expectBadgeUpsert(payload.badges, "1324165498");
    expect(response.error).toMatchObject({
      code: "InvalidToken",
      message: "Unknown key",
      details: "details",
      hint: "",
    });
    expect(response.data).toBeNull();
  });

  it("throws if content insert throws an exception", async () => {
    mockIn.mockReturnValueOnce({
      data: [{ badge_id: "123546" }],
      error: null,
    });
    mockInsert.mockImplementationOnce(() => {
      throw new Error("DB connection lost");
    });

    const payload: TestPayload = {
      title: "Title",
      explanation: "explanation2",
      badges: [fullBadge("123546", "Badge1")],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
    };

    let error: unknown;
    try {
      await contentService.create(payload, "user@gmail.com");
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
    mockInsert.mockReturnValueOnce({
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

    const payload: TestPayload = {
      title: "Title",
      explanation: "explanation3",
      badges: [fullBadge("123546", "Badge1")],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
    };

    let error: unknown;
    try {
      await contentService.create(payload, "user@gmail.com");
    } catch (e) {
      error = e;
    }

    expectContentInsert(payload, "user@gmail.com");
    expect(error).toBeInstanceOf(Error);
    expect((error as { message: string }).message).toBe("Upsert failed");
  });

  it("returns a PostgREST not-null error if no badges are provided", async () => {
    const payload: TestPayload = {
      title: "Title",
      explanation: "explanation4",
      badges: [],
      illustration: "0.2541654.png",
      status: CONTENT_STATUS.PENDING,
    };

    const response = await contentService.create(payload, "user@gmail.com");

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
});
