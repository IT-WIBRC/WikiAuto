import { afterAll, describe, expect, it, vi } from "vitest";
import useSupabase from "~/api/utils/supabaseInit";
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

vi.mock("~/api/utils/supabaseInit", () => ({
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
      vi.doUnmock("~/api/utils/supabaseInit");
    });

    it("signs in the user with the provided email and password", async () => {
      await authService.login("user@email.com", "securepassword");
      expect(useSupabaseInstance.auth.signInWithPassword).toHaveBeenCalledTimes(
        1,
      );
      expect(useSupabaseInstance.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "user@email.com",
        password: "securepassword",
      });
    });
  });

  describe("Logout", () => {
    afterAll(() => {
      vi.doUnmock("~/api/utils/supabaseInit");
    });

    it("signs out the user with global scope", async () => {
      await authService.logout();
      expect(useSupabaseInstance.auth.signOut).toHaveBeenCalledTimes(1);
      expect(useSupabaseInstance.auth.signOut).toHaveBeenCalledWith({
        scope: "global",
      });
    });
  });

  describe("getUserProfile", () => {
    afterAll(() => {
      vi.doUnmock("~/api/utils/supabaseInit");
    });

    it("fetches the user profile using the correct query and user id", async () => {
      const singleMock = vi.fn();
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        single: singleMock,
      });
      await authService.getUserProfile("user-42");
      expect(useSupabaseInstance.from).toHaveBeenCalledWith("profile");

      const fromInstance = mockFrom.mock.results[0].value;
      expect(fromInstance.select).toHaveBeenCalledWith(
        "email, username, lastname, firstname, created_at",
      );
      expect(fromInstance.eq).toHaveBeenCalledWith("user_id", "user-42");
      expect(fromInstance.single).toHaveBeenCalledTimes(1);
    });
  });

  describe("editUserInfo", () => {
    it("updates the user info and queries the updated profile", async () => {
      mockUpdate.mockClear();
      mockEq.mockClear();
      mockSelect.mockClear();
      mockSingle.mockClear();

      const payload = {
        username: "updateduser",
        lastname: "Smith",
        firstname: "Jane",
        user_id: "user-99",
      };
      await authService.editUserInfo(payload);

      expect(mockFrom).toHaveBeenCalledWith("profile");
      expect(mockUpdate).toHaveBeenCalledWith({
        username: "updateduser",
        lastname: "Smith",
        firstname: "Jane",
      });
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-99");
      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(mockSingle).toHaveBeenCalledTimes(1);
    });
  });
});
