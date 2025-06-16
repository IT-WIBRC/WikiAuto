import { afterAll, describe, expect, it, vi } from "vitest";
import useSupabase from "~/api/supabaseInit";
import { authService } from "~/api/authService";

const mockSelect = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockSingle = vi.fn();
const mockUpdate = vi.fn().mockReturnThis();

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  eq: mockEq,
  single: mockSingle,
  update: mockUpdate,
}));

const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();

vi.mock("~/api/supabaseInit", () => ({
  default: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
    },
    from: mockFrom,
  }),
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

  describe("Logout", () => {
    afterAll(() => {
      vi.doUnmock("~/api/supabaseInit");
    });

    it("should sign out the user", async () => {
      await authService.logout();
      expect(useSupabaseInstance.auth.signOut).toHaveBeenCalledTimes(1);
      expect(useSupabaseInstance.auth.signOut).toHaveBeenCalledWith({
        scope: "global",
      });
    });
  });

  describe("getUserProfile", () => {
    afterAll(() => {
      vi.doUnmock("~/api/supabaseInit");
    });

    it("should fetch the user profile with correct query", async () => {
      const singleMock = vi.fn();
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        single: singleMock,
      });
      await authService.getUserProfile("user-id");
      expect(useSupabaseInstance.from).toHaveBeenCalledWith("profile");

      const fromInstance = useSupabaseInstance.from.mock.results[0].value;
      expect(fromInstance.select).toHaveBeenCalledWith(
        "email, username, lastname, firstname, created_at",
      );
      expect(fromInstance.eq).toHaveBeenCalledWith("user_id", "user-id");
      expect(fromInstance.single).toHaveBeenCalled();
    });
  });

  describe("editUserInfo", () => {
    it("calls update, eq, select, and single with correct params", async () => {
      mockUpdate.mockClear();
      mockEq.mockClear();
      mockSelect.mockClear();
      mockSingle.mockClear();

      const payload = {
        username: "newuser",
        lastname: "Doe",
        firstname: "John",
        user_id: "user-123",
      };
      await authService.editUserInfo(payload);

      expect(mockFrom).toHaveBeenCalledWith("profile");
      expect(mockUpdate).toHaveBeenCalledWith({
        username: "newuser",
        lastname: "Doe",
        firstname: "John",
      });
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
    });
  });
});
