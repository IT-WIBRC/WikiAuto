import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import App from "~/app.vue";

describe("App", () => {
  it("should render correctly", async () => {
    const appWrapper = await mountSuspended(App);
    expect(appWrapper.exists()).toBe(true);
  });

  it("should display the awaited content", async () => {
    const appWrapper = await mountSuspended(App);
    expect(appWrapper.text()).toBe("Welcome to the starter page  Login");
  });
});
