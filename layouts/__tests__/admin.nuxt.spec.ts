import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeAll, describe, expect, it } from "vitest";
import AdminLayout from "~/layouts/Admin.vue";
import type { VueWrapper } from "@vue/test-utils";
import MenuSide from "~/components/menu/side.vue";

describe("AdminLayout", () => {
  let adminLayoutWrapper: VueWrapper;
  beforeAll(async () => {
    adminLayoutWrapper = await mountSuspended(AdminLayout, {
      slots: {
        default: "My content must be here",
      },
      shallow: true,
    });
  });

  it("should render correctly", async () => {
    expect(adminLayoutWrapper.exists()).toBe(true);
  });

  it("should display the awaited content", async () => {
    expect(adminLayoutWrapper.text()).toBe("My content must be here");
  });

  it("should render the menu side", async () => {
    expect(adminLayoutWrapper.findComponent(MenuSide).exists()).toBe(true);
  });
});
