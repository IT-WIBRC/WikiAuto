import {afterAll, describe, expect, it, vi} from "vitest";
import createSupabaseClient from "../supabaseInit";

vi.mock("@supabase/supabase-js", async () => {
    const supabaseCreateClient = await vi.importActual('@supabase/supabase-js');//useful if you want to mock module partially.
    return {
        ...supabaseCreateClient,
        createClient: vi.fn((url: string, key: string) => url+key),
    }
});
import { createClient } from "@supabase/supabase-js";

afterAll(() => {
    vi.doUnmock("@supabase/supabase-js");
});

describe("supabaseInit test", () => {
    it("should create the client when called", () => {
        const supabaseClient = createSupabaseClient();

        expect(createClient).toHaveBeenCalledOnce();
        expect(createClient).toHaveBeenCalledWith("myUrl", "eyJhbGciOi");
        expect(supabaseClient).toBe("myUrleyJhbGciOi");
    });

    it("should not create more than one instance", () => {
        expect(createClient).toHaveBeenCalledTimes(1);//Due to the hoisting of `vi.mock` which cannot been reset ofr each test
        let supabaseClient = createSupabaseClient();
        expect(createClient).toHaveBeenCalledTimes(1);
        expect(createClient).toHaveBeenCalledWith("myUrl", "eyJhbGciOi");
        expect(supabaseClient).toBe("myUrleyJhbGciOi");

        supabaseClient = createSupabaseClient();
        expect(createClient).toHaveBeenCalledTimes(1);
        expect(supabaseClient).toBe("myUrleyJhbGciOi");
    });
});