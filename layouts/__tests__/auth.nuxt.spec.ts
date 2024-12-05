import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import AuthLayout from "~/layouts/auth.vue";

describe("AuthLayout", () => {
  it("should render correctly", async () => {
    const authLayoutWrapper = await mountSuspended(AuthLayout);
    expect(authLayoutWrapper.exists()).toBe(true);
  });

  it("should display the awaited content", async () => {
    const authLayoutWrapper = await mountSuspended(AuthLayout, {
      slots: {
        default: "My content must be here",
      },
    });
    expect(authLayoutWrapper.text()).toBe("My content must be here");
  });
});
