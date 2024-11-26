import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import {
  CardDashboardBase,
  CardDashboardTotalContent,
  IconContent,
} from "#components";
import { createTestingPinia } from "@pinia/testing";
import { useContentStore } from "~/stores/content.store";

describe("CardDashboardTotalContent", () => {
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

  let cardDashboardTotalContent: VueWrapper;
  beforeAll(async () => {
    cardDashboardTotalContent = await mountSuspended(
      CardDashboardTotalContent,
      {
        global: {
          plugins: [pinia],
        },
      },
    );
  });

  afterAll(() => {
    vi.resetModules();
  });

  it("should render correctly", () => {
    expect(cardDashboardTotalContent.exists()).toBe(true);
  });

  it("should render the base dashboard card", () => {
    const cardDashboardBase =
      cardDashboardTotalContent.findComponent(CardDashboardBase);
    expect(cardDashboardBase.exists()).toBe(true);
    expect(cardDashboardBase.props().value).toBe("178");
    expect(cardDashboardBase.props().description).toBe("total");
    expect(cardDashboardBase.findComponent(IconContent).exists()).toBe(true);
  });
});
