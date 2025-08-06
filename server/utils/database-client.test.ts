import {
  describe, it, expect, vi, afterEach, beforeEach
} from "vitest";
import {
  useDatabaseClient,
  _clearDatabaseClientInstanceForTesting,
} from "./database-client";
import { mockSupabaseClientInstance } from "~/vitest.setup";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

const { mockUseRuntimeConfig, mockCreateClient } = vi.hoisted(() => {
  const mockUseRuntimeConfig = vi.fn();
  const mockCreateClient = vi.fn();

  return {
    mockUseRuntimeConfig,
    mockCreateClient,
  };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: mockCreateClient,
}));

mockNuxtImport("useRuntimeConfig", () => mockUseRuntimeConfig);

const mockSupabaseUrl = "https://mock.supabase.co";
const mockAnonKey = "mock-anon-key";

describe("useDatabaseClient (server-side singleton)", () => {
  beforeEach(() => {
    _clearDatabaseClientInstanceForTesting();
    mockCreateClient.mockReset();
    mockUseRuntimeConfig.mockReset();
  });

  afterEach(() => {
    mockCreateClient.mockClear();
    mockUseRuntimeConfig.mockClear();
  });

  it("should create and return a Supabase client using the anon key", () => {
    mockCreateClient.mockReturnValueOnce(mockSupabaseClientInstance);
    mockUseRuntimeConfig.mockReturnValueOnce({
      public: {
        databaseUrl: mockSupabaseUrl,
        databaseClientKey: mockAnonKey,
      },
    });

    const client = useDatabaseClient();

    expect(mockUseRuntimeConfig).toHaveBeenCalledTimes(1);
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockCreateClient).toHaveBeenCalledWith(
      mockSupabaseUrl,
      mockAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      },
    );
    expect(client).toBe(mockSupabaseClientInstance);
  });

  it("should return the same client instance on subsequent calls (singleton)", () => {
    mockCreateClient.mockReturnValueOnce(mockSupabaseClientInstance);
    mockUseRuntimeConfig.mockReturnValueOnce({
      public: {
        databaseUrl: mockSupabaseUrl,
        databaseClientKey: mockAnonKey,
      },
    });

    const firstClient = useDatabaseClient();
    const secondClient = useDatabaseClient();

    expect(mockUseRuntimeConfig).toHaveBeenCalledTimes(1);
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(firstClient).toBe(mockSupabaseClientInstance);
    expect(secondClient).toBe(mockSupabaseClientInstance);
    expect(firstClient).toBe(secondClient);
  });

  it("should throw an error if Supabase URL is not configured", () => {
    mockUseRuntimeConfig.mockReturnValueOnce({
      public: {
        databaseUrl: undefined,
        databaseClientKey: mockAnonKey,
      },
    });

    expect(() => useDatabaseClient()).toThrow(
      "Database URL (NUXT_PUBLIC_DATABASE_URL) is not configured in runtimeConfig.",
    );
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("should throw an error if Supabase Anon Key is not configured", () => {
    mockUseRuntimeConfig.mockReturnValueOnce({
      public: {
        databaseUrl: mockSupabaseUrl,
        databaseClientKey: undefined,
      },
    });

    expect(() => useDatabaseClient()).toThrow(
      "Database Client Key (NUXT_PUBLIC_DATABASE_CLIENT_KEY) is not configured in runtimeConfig.",
    );
    expect(mockCreateClient).not.toHaveBeenCalled();
  });
});
