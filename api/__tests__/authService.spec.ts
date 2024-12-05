import { afterAll, describe, expect, it, vi } from "vitest";
import useSupabase from "~/api/supabaseInit";
import { authService } from "~/api/authService";

const mockSignInWithPassword = vi.hoisted(() => ({
  auth: {
    signInWithPassword: vi.fn(),
  },
}));

vi.mock("~/api/supabaseInit", () => ({
  default: () => mockSignInWithPassword,
}));

describe("Auth services", () => {
  const useSupabaseInstance = useSupabase();
  describe("Login", () => {
    afterAll(() => {
      vi.doUnmock("~/api/supabaseInit");
    });

    it("should sign in the user with password", async () => {
      await authService.login("email", "password");
      expect(useSupabaseInstance.auth.signInWithPassword).toHaveBeenCalledTimes(
        1,
      );
      expect(useSupabaseInstance.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "email",
        password: "password",
      });
    });
  });
});
