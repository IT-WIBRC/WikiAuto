import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { navigateTo } from "nuxt/app";
import { createPinia, setActivePinia } from "pinia";
import authMiddleware from "../auth.middleware";
import { useAuthStore } from "../../stores/auth.store";

vi.mock("nuxt/app", () => {
  return {
    navigateTo: vi.fn(),
  };
});

describe("Aut middleware", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    useAuthStore().session = null;
  });

  afterAll(() => {
    vi.doUnmock("nuxt/app");
  });

  it("should redirect to the '/auth' page when the user is not logged in", async () => {
    await authMiddleware();
    expect(navigateTo).toHaveBeenCalledOnce();
    expect(navigateTo).toHaveBeenCalledWith("/auth");
  });

  it.only("should redirect to the '/auth' page when the user is not logged in", async () => {
    useAuthStore().session = {
      access_token: "access_token",
      refresh_token: "refresh_token",
      expires_in: "120950",
      user: {
        id: "b4ebcf93-7b09-4ee1-bbb3-0a67c1cb1748",
        app_metadata: {},
        user_metadata: {},
        aud: "fb2e796d-69f7-451a-8434-2307d1436d48",
      },
    };
    await authMiddleware();
    expect(navigateTo).not.toHaveBeenCalled();
  });
});
