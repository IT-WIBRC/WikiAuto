import { afterAll, describe, expect, it, vi } from "vitest";
import createSupabaseClient from "../supabaseInit";

const { mockClientCreation } = vi.hoisted(() => {
  return { mockClientCreation: vi.fn((url: string, key: string) => url + key) };
});

vi.mock("@supabase/supabase-js", async () => {
  const supabaseCreateClient = await vi.importActual("@supabase/supabase-js");
  return {
    ...supabaseCreateClient,
    createClient: mockClientCreation,
  };
});

afterAll(() => {
  vi.doUnmock("@supabase/supabase-js");
});

describe("supabaseInit test", () => {
  it("should not create more than one instance", () => {
    expect(mockClientCreation).toHaveBeenCalledTimes(0);
    let supabaseClient = createSupabaseClient();
    expect(mockClientCreation).toHaveBeenCalledTimes(1);
    expect(mockClientCreation).toHaveBeenCalledWith("myUrl", "eyJhbGciOi");
    expect(supabaseClient).toBe("myUrleyJhbGciOi");

    supabaseClient = createSupabaseClient();
    expect(mockClientCreation).toHaveBeenCalledTimes(1);
    expect(supabaseClient).toBe("myUrleyJhbGciOi");
  });

  it("should create the client when called", () => {
    const supabaseClient = createSupabaseClient();

    expect(mockClientCreation).toHaveBeenCalledOnce();
    expect(mockClientCreation).toHaveBeenCalledWith("myUrl", "eyJhbGciOi");
    expect(supabaseClient).toBe("myUrleyJhbGciOi");
  });
});
