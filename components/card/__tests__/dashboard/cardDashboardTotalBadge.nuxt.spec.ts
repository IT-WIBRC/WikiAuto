import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import {
  CardDashboardBase,
  CardDashboardTotalBadge,
  IconBadge,
} from "#components";
import useUnitTestUtils from "~/utils/useUnitTestUtils";

describe("CardDashboardTotalBadge", () => {
  const pinia = useUnitTestUtils.getPiniaInstance({ stubActions: true });

  const badgeStore = useBadgeStore(pinia);
  badgeStore.fetchTotalBadges = vi.fn().mockReturnValue({
    status: "success",
    data: 178,
  });

  let cardDashboardTotalBadge: VueWrapper;
  beforeAll(async () => {
    cardDashboardTotalBadge = await mountSuspended(CardDashboardTotalBadge, {
      global: {
        plugins: [pinia],
      },
    });
  });

  afterAll(() => {
    vi.resetModules();
  });

  it("should render correctly", () => {
    expect(cardDashboardTotalBadge.exists()).toBe(true);
  });

  it("should render the base dashboard card with awaited attributes", () => {
    const cardDashboardBase =
      cardDashboardTotalBadge.findComponent(CardDashboardBase);
    expect(cardDashboardBase.props().value).toBe("178");
    expect(cardDashboardBase.exists()).toBe(true);
    expect(cardDashboardBase.props().description).toBe("total");
    expect(cardDashboardBase.findComponent(IconBadge).exists()).toBe(true);
  });
});
