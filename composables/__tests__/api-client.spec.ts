import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { useApiClient, _clearApiClientInstanceForTesting } from "../api-client";
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

describe("useApiClient (server-side singleton)", () => {
  beforeEach(() => {
    _clearApiClientInstanceForTesting();
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

    const client = useApiClient();

    expect(mockUseRuntimeConfig).toHaveBeenCalledTimes(1);
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockCreateClient).toHaveBeenCalledWith(mockSupabaseUrl, mockAnonKey);
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

    const firstClient = useApiClient();
    const secondClient = useApiClient();

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

    expect(() => useApiClient()).toThrow(
      "API Endpoint URL is missing in runtime config. Please check your .env file.",
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

    expect(() => useApiClient()).toThrow(
      "API Public API Key is missing in runtime config. Please check your  env file.",
    );
    expect(mockCreateClient).not.toHaveBeenCalled();
  });
});
