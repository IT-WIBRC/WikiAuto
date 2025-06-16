import { beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useUserStore } from "../user.store";
import { GenericErrors } from "~/api/types";
import { wrapServiceCall } from "~/api/wrapServiceCall";

vi.mock("~/api/authService", () => ({
  authService: {
    getUserProfile: vi.fn(),
    editUserInfo: vi.fn(),
  },
}));
vi.mock("~/api/wrapServiceCall", () => ({
  wrapServiceCall: vi.fn(),
}));

describe("UserStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should set current user id and email", () => {
    const userStore = useUserStore();
    userStore.setCurrentUserIdAndEmail("id123", "mail@mail.com");
    expect(userStore.currentUser.id).toBe("id123");
    expect(userStore.currentUser.email).toBe("mail@mail.com");
  });

  it("should set current other user info", () => {
    const userStore = useUserStore();
    const profile = {
      firstname: "John",
      lastname: "Doe",
      username: "johndoe",
      created_at: "2023-01-01",
    };
    userStore.setCurrentOtherUserInfo(profile);
    expect(userStore.currentUser.firstname).toBe("John");
    expect(userStore.currentUser.lastname).toBe("Doe");
    expect(userStore.currentUser.username).toBe("johndoe");
    expect(userStore.currentUser.created_at).toBe("2023-01-01");
  });

  it("should mark profile as fetched", () => {
    const userStore = useUserStore();
    userStore.markProfileAsFetched();
    expect(userStore.hasAlreadyFetchUserProfile).toBe(true);
  });

  it("should get profile and update state on success", async () => {
    const userStore = useUserStore();
    userStore.currentUser.id = "id123";
    const profile = {
      firstname: "John",
      lastname: "Doe",
      username: "johndoe",
      created_at: "2023-01-01",
    };
    (
      wrapServiceCall as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      status: "success",
      response: { data: profile },
    });
    const result = await userStore.getProfile();
    expect(userStore.currentUser.firstname).toBe("John");
    expect(userStore.hasAlreadyFetchUserProfile).toBe(true);
    expect(result).toEqual({ status: "success", data: undefined });
  });

  it("should return error if getProfile returns no data", async () => {
    const userStore = useUserStore();
    userStore.currentUser.id = "id123";
    (
      wrapServiceCall as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      status: "success",
      response: { data: null },
    });
    const result = await userStore.getProfile();
    expect(result).toEqual({
      status: "error",
      message: GenericErrors.UNKNOWN_ERROR,
    });
  });

  it("should return error if getProfile fails", async () => {
    const userStore = useUserStore();
    userStore.currentUser.id = "id123";
    (
      wrapServiceCall as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      status: "error",
      message: "fail",
    });
    const result = await userStore.getProfile();
    expect(result).toEqual({
      status: "error",
      message: "fail",
    });
  });

  it("should update info and state on success", async () => {
    const userStore = useUserStore();
    const profile = {
      firstname: "Jane",
      lastname: "Smith",
      username: "jsmith",
      created_at: "2023-02-02",
    };
    (
      wrapServiceCall as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      status: "success",
      response: { data: profile },
    });
    const result = await userStore.updateInfo({
      firstname: "Jane",
      lastname: "Smith",
      username: "jsmith",
      user_id: "id123",
    });
    expect(userStore.currentUser.firstname).toBe("Jane");
    expect(result).toEqual({
      status: "success",
      data: profile,
    });
  });

  it("should return error if updateInfo returns no data", async () => {
    const userStore = useUserStore();
    (
      wrapServiceCall as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      status: "success",
      response: { data: null },
    });
    const result = await userStore.updateInfo({
      firstname: "Jane",
      lastname: "Smith",
      username: "jsmith",
      user_id: "id123",
    });
    expect(result).toEqual({
      status: "error",
      message: GenericErrors.UNKNOWN_ERROR,
    });
  });

  it("should return error if updateInfo fails", async () => {
    const userStore = useUserStore();
    (
      wrapServiceCall as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      status: "error",
      message: "fail",
    });
    const result = await userStore.updateInfo({
      firstname: "Jane",
      lastname: "Smith",
      username: "jsmith",
      user_id: "id123",
    });
    expect(result).toEqual({
      status: "error",
      message: "fail",
    });
  });

  it("should return true for isAuthenticated if currentUser exists", () => {
    const userStore = useUserStore();
    userStore.currentUser = { id: "id", email: "mail" };
    expect(userStore.isAuthenticated).toBe(true);
  });

  it("should return false for isAuthenticated if currentUser is falsy", () => {
    const userStore = useUserStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userStore.currentUser = undefined as any;
    expect(userStore.isAuthenticated).toBe(false);
  });
});
