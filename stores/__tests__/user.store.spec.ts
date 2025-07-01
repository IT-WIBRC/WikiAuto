import { beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useUserStore } from "~/stores/user.store";
import { authService, GenericErrors } from "~/api";

describe("UserStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const profile = {
    user_id: "id123",
    firstname: "John",
    lastname: "Doe",
    username: "johndoe",
    created_at: "2023-01-01",
    email: "1212",
  };

  it("should set current user id and email", () => {
    const userStore = useUserStore();
    userStore.setCurrentUserIdAndEmail("id123", "mail@mail.com");
    expect(userStore.currentUser.id).toBe("id123");
    expect(userStore.currentUser.email).toBe("mail@mail.com");

    userStore.$dispose();
  });

  it("should set current other user info", () => {
    const userStore = useUserStore();
    userStore.setCurrentOtherUserInfo(profile);
    expect(userStore.currentUser.firstname).toBe("John");
    expect(userStore.currentUser.lastname).toBe("Doe");
    expect(userStore.currentUser.username).toBe("johndoe");
    expect(userStore.currentUser.created_at).toBe("2023-01-01");

    userStore.$dispose();
  });

  it("should mark profile as fetched", () => {
    const userStore = useUserStore();
    userStore.markProfileAsFetched();
    expect(userStore.hasAlreadyFetchUserProfile).toBe(true);

    userStore.$dispose();
  });

  it("should get profile and update state on success", async () => {
    const userStore = useUserStore();
    userStore.currentUser.id = "id123";
    vi.spyOn(authService, "getUserProfile").mockResolvedValueOnce({
      data: profile,
      error: null,
      status: 200,
      statusText: "OK",
      count: null,
    });

    const result = await userStore.getProfile();
    expect(userStore.currentUser.firstname).toBe("John");
    expect(userStore.hasAlreadyFetchUserProfile).toBe(true);
    expect(result).toEqual({
      status: "success",
      data: profile,
    });

    userStore.$dispose();
  });

  it("should return error if getProfile returns no data", async () => {
    const userStore = useUserStore();
    userStore.currentUser.id = "id123";

    vi.spyOn(authService, "getUserProfile").mockResolvedValueOnce({
      data: null,
      error: null,
      status: 200,
      statusText: "OK",
      count: null,
    });

    const result = await userStore.getProfile();
    expect(result).toEqual({
      status: "error",
      message: GenericErrors.NOT_FOUND,
    });

    userStore.$dispose();
  });

  it("should return error if getProfile fails", async () => {
    const userStore = useUserStore();
    userStore.currentUser.id = "id123";
    vi.spyOn(authService, "getUserProfile").mockResolvedValueOnce({
      data: null,
      error: {
        message: "fail",
        code: "PGRST301",
        details: "",
        hint: "",
        name: "",
      },
      status: 200,
      statusText: "OK",
      count: null,
    });
    const result = await userStore.getProfile();
    expect(result).toEqual({
      status: "error",
      message: GenericErrors.UNAUTHORIZED,
    });

    userStore.$dispose();
  });

  it("should update info and state on success", async () => {
    const userStore = useUserStore();
    const profileResult = {
      ...profile,
      firstname: "Jane",
    };

    vi.spyOn(authService, "editUserInfo").mockResolvedValueOnce({
      data: profileResult,
      error: null,
      status: 200,
      statusText: "OK",
      count: null,
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
    });

    userStore.$dispose();
  });

  it("should return error if updateInfo returns no data", async () => {
    const userStore = useUserStore();
    vi.spyOn(authService, "editUserInfo").mockResolvedValueOnce({
      data: [],
      error: null,
      status: 200,
      statusText: "OK",
      count: null,
    });
    const result = await userStore.updateInfo({
      firstname: "Jane",
      lastname: "Smith",
      username: "jsmith",
      user_id: "id123",
    });
    expect(result).toEqual({
      status: "error",
      message: GenericErrors.NOT_FOUND,
    });

    userStore.$dispose();
  });

  it("should return error if updateInfo fails", async () => {
    const userStore = useUserStore();
    vi.spyOn(authService, "editUserInfo").mockResolvedValueOnce({
      data: null,
      error: {
        message: "fail",
        code: "409",
        details: "",
        hint: "",
        name: "",
      },
      status: 200,
      statusText: "OK",
      count: null,
    });
    const result = await userStore.updateInfo({
      firstname: "Jane",
      lastname: "Smith",
      username: "jsmith",
      user_id: "id123",
    });
    expect(result).toEqual({
      status: "error",
      message: GenericErrors.CONFLICT,
    });
  });

  it("should return true for isAuthenticated if currentUser exists", () => {
    const userStore = useUserStore();
    userStore.currentUser = {
      id: "id",
      email: "mail",
    };
    expect(userStore.isAuthenticated).toBe(true);

    userStore.$dispose();
  });

  it("should return false for isAuthenticated if currentUser is falsy", () => {
    const userStore = useUserStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userStore.currentUser = undefined as any;
    expect(userStore.isAuthenticated).toBe(false);

    userStore.$dispose();
  });
});
