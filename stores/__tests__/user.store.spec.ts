import { beforeEach, describe, expect, it } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useUserStore } from "../user.store";

describe("UserStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should update the current user when set", async () => {
    const userStore = useUserStore();
    expect(userStore.currentUser).toBeNull();
    const user = {
      id: "b4ebcf93-7b09-4ee1-bbb3-0a67c1cb1748",
      app_metadata: {},
      user_metadata: {},
      aud: "fb2e796d-69f7-451a-8434-2307d1436d48",
    };

    userStore.currentUser = { ...user };
    expect(userStore.currentUser).toEqual(user);
  });
});
