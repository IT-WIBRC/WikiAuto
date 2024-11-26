import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import Dashboard from "../index.vue";
import IconContent from "~/components/icon/content.vue";
import MenuSide from "~/components/menu/side.vue";
import { createTestingPinia } from "@pinia/testing";
import { useContentStore } from "../../../stores/content.store";

describe("Dashboard", () => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
  });
  const contentStore = useContentStore(pinia);
  contentStore.fetchTotalContent = vi.fn().mockReturnValue({
    status: "success",
    data: 178,
  });

  mockNuxtImport("useI18n", () => {
    return () => ({
      t: vi.fn((msg: string) => msg),
    });
  });

  let dashboard: VueWrapper;
  beforeAll(async () => {
    dashboard = await mountSuspended(Dashboard, {
      global: {
        plugins: [pinia],
      },
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
    const totalContent = dashboard.findComponent("[data-cy='total-content']");
    expect(totalContent.exists()).toBe(true);
    expect(totalContent.props()).toEqual({
      title: "178",
      description: "card.content.total",
    });
    expect(totalContent.findComponent(IconContent).exists()).toBe(true);
  });
});
