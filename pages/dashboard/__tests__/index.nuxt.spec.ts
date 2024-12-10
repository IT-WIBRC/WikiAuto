import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import Dashboard from "../index.vue";
import MenuSide from "~/components/menu/side.vue";
import CardDashboardTotalContent from "~/components/card/dashboard/TotalContent.vue";
import CardDashboardTotalValidatedContent from "~/components/card/dashboard/TotalValidatedContent.vue";

describe("Dashboard", () => {
  mockNuxtImport("useI18n", () => {
    return () => ({
      t: vi.fn((msg: string) => msg),
    });
  });

  let dashboard: VueWrapper;
  beforeAll(async () => {
    dashboard = await mountSuspended(Dashboard, {
      shallow: true,
    });
  });

  afterAll(() => {
    vi.resetModules();
  });

  it("should render correctly", () => {
    expect(dashboard.exists()).toBe(true);
  });

  it("should render menu side", () => {
    expect(dashboard.findComponent(MenuSide).exists()).toBe(true);
  });

  it("should display the title", () => {
    expect(dashboard.find("[data-cy='dashboard-title']").text()).toBe("ttl");
  });

  it("should render the card containing the total content in the system", () => {
    expect(dashboard.findComponent(CardDashboardTotalContent).exists()).toBe(
      true,
    );
  });

  it("should render the card containing the total validated content in the system", () => {
    expect(
      dashboard.findComponent(CardDashboardTotalValidatedContent).exists(),
    ).toBe(true);
  });
});
