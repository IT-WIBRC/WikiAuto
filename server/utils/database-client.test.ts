import { describe, it, expect, vi } from "vitest";
import { useRequestClient } from "./database-client";
import type { H3Event } from "h3";
import { mockSupabaseClientInstance } from "~/vitest.setup";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

const {
  mockUseRuntimeConfig,
  mockCreateServerClient,
  mockGetHeader,
  mockSetHeader,
  mockGetCookie,
  mockSetCookie,
} = vi.hoisted(() => {
  const mockUseRuntimeConfig = vi.fn();
  const mockCreateServerClient = vi.fn();
  const mockGetHeader = vi.fn();
  const mockSetHeader = vi.fn();
  const mockGetCookie = vi.fn();
  const mockSetCookie = vi.fn();
  return {
    mockUseRuntimeConfig,
    mockCreateServerClient,
    mockGetHeader,
    mockSetHeader,
    mockGetCookie,
    mockSetCookie,
  };
});

vi.mock("@supabase/ssr", () => ({
  createServerClient: mockCreateServerClient,
}));

vi.mock("h3", () => ({
  getHeader: mockGetHeader,
  setHeader: mockSetHeader,
  getCookie: mockGetCookie,
  setCookie: mockSetCookie,
}));

mockNuxtImport("useRuntimeConfig", () => mockUseRuntimeConfig);

const mockSupabaseUrl = "https://mock.supabase.co";
const mockAnonKey = "mock-anon-key";

describe("useRequestClient (server-side factory)", () => {
  const mockEvent: H3Event = {
    req: {
      headers: {
        cookie: "sb-auth-token=mock-token",
      },
    },
    node: {
      res: {
        setHeader: vi.fn(),
      },
    },
    context: {},
  } as unknown as H3Event;

  beforeEach(() => {
    mockCreateServerClient.mockReset();
    mockUseRuntimeConfig.mockReset();
    mockGetHeader.mockReset();
    mockSetHeader.mockReset();
    mockGetCookie.mockReset();
    mockSetCookie.mockReset();
  });

  it("should create and return a Supabase client using the provided H3Event", () => {
    mockCreateServerClient.mockReturnValueOnce(mockSupabaseClientInstance);
    mockUseRuntimeConfig.mockReturnValueOnce({
      public: {
        supabaseUrl: mockSupabaseUrl,
        supabaseKey: mockAnonKey,
      },
    });
    mockGetHeader.mockReturnValueOnce("cookie1=value1; cookie2=value2");

    const client = useRequestClient(mockEvent);

    expect(mockUseRuntimeConfig).toHaveBeenCalledTimes(1);
    expect(mockCreateServerClient).toHaveBeenCalledTimes(1);
    expect(mockCreateServerClient).toHaveBeenCalledWith(
      mockSupabaseUrl,
      mockAnonKey,
      expect.objectContaining({
        cookies: {
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        },
      }),
    );
    expect(client).toBe(mockSupabaseClientInstance);
  });

  it("should correctly parse and get cookies using the getAll method", () => {
    mockCreateServerClient.mockImplementationOnce((_url, _key, options) => {
      mockGetHeader.mockReturnValueOnce(
        "cookie1=value1; cookie2=value2; third=val_3",
      );
      const cookies = options.cookies.getAll();
      expect(cookies).toEqual([
        {
          name: "cookie1",
          value: "value1",
        },
        {
          name: "cookie2",
          value: "value2",
        },
        {
          name: "third",
          value: "val_3",
        },
      ]);
      return mockSupabaseClientInstance;
    });

    mockUseRuntimeConfig.mockReturnValueOnce({
      public: {
        supabaseUrl: mockSupabaseUrl,
        supabaseKey: mockAnonKey,
      },
    });

    useRequestClient(mockEvent);
    expect(mockGetHeader).toHaveBeenCalledWith(mockEvent, "cookie");
  });

  it("should correctly serialize and set cookies using the setAll method", () => {
    const cookiesToSet = [
      {
        name: "sb-auth-token",
        value: "some-token",
        options: {
          path: "/",
          httpOnly: true,
        },
      },
      {
        name: "other-cookie",
        value: "other-value",
        options: { secure: true },
      },
    ];

    mockCreateServerClient.mockImplementationOnce((_url, _key, options) => {
      options.cookies.setAll(cookiesToSet);
      return mockSupabaseClientInstance;
    });

    mockUseRuntimeConfig.mockReturnValueOnce({
      public: {
        supabaseUrl: mockSupabaseUrl,
        supabaseKey: mockAnonKey,
      },
    });

    useRequestClient(mockEvent);

    expect(mockSetHeader).toHaveBeenCalledWith(mockEvent, "Set-Cookie", [
      "sb-auth-token=some-token; HttpOnly; Path=/",
      "other-cookie=other-value; Secure",
    ]);
  });

  it("should throw an error if Supabase URL is not configured", () => {
    mockUseRuntimeConfig.mockReturnValueOnce({
      public: {
        supabaseUrl: undefined,
        supabaseKey: mockAnonKey,
      },
    });

    expect(() => useRequestClient(mockEvent)).toThrow(
      "Supabase URL is missing in runtime config. Please check your .env file.",
    );
    expect(mockCreateServerClient).not.toHaveBeenCalled();
  });

  it("should throw an error if Supabase Anon Key is not configured", () => {
    mockUseRuntimeConfig.mockReturnValueOnce({
      public: {
        supabaseUrl: mockSupabaseUrl,
        supabaseKey: undefined,
      },
    });

    expect(() => useRequestClient(mockEvent)).toThrow(
      "Supabase Key is missing in runtime config. Please check your .env file.",
    );
    expect(mockCreateServerClient).not.toHaveBeenCalled();
  });
});
