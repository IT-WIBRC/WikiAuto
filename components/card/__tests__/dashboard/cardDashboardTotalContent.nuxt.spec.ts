import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import {
  CardDashboardBase,
  CardDashboardTotalContent,
  IconContent,
} from "#components";
import { useContentStore } from "~/stores/content.store";
import useUnitTestUtils from "~/utils/useUnitTestUtils";

describe("CardDashboardTotalContent", () => {
  const pinia = useUnitTestUtils.getPiniaInstance({ stubActions: true });

  const contentStore = useContentStore(pinia);
  contentStore.fetchTotalContent = vi.fn().mockReturnValue({
    status: "success",
    data: 178,
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

  it("should render the base dashboard card with awaited attributes", () => {
    const cardDashboardBase =
      cardDashboardTotalContent.findComponent(CardDashboardBase);
    expect(cardDashboardBase.exists()).toBe(true);
    expect(cardDashboardBase.props().value).toBe("178");
    expect(cardDashboardBase.props().description).toBe("total");
    expect(cardDashboardBase.findComponent(IconContent).exists()).toBe(true);
  });
});
