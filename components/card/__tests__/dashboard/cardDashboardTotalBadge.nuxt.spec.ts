import {
  afterAll, beforeEach, describe, expect, it, vi
} from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import {
  CardDashboardBase,
  CardDashboardTotalBadge,
  IconBadge,
  SkeletonDashboardCard,
} from "#components";
import useUnitTestUtils from "~/utils/useUnitTestUtils";
import { realtimeObserver } from "~/api/realtime/realtimeObserver";

vi.mock("~/api/realtime/realtimeObserver", () => ({
  realtimeObserver: {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  },
}));

describe("CardDashboardTotalBadge", () => {
  const pinia = useUnitTestUtils.getPiniaInstance({ stubActions: true });

  const badgeStore = useBadgeStore(pinia);
  badgeStore.fetchBadgeCount = vi.fn().mockReturnValue({
    status: "success",
    data: 178,
  });

  let cardDashboardTotalBadge: VueWrapper;
  beforeEach(async () => {
    cardDashboardTotalBadge = await mountSuspended(CardDashboardTotalBadge, {
      global: {
        plugins: [pinia],
      },
    });
  });

  afterAll(() => {
    vi.resetModules();
  });

  it("shows loading skeleton while loading", async () => {
    badgeStore.fetchBadgeCount.mockImplementationOnce(
      () => new Promise(() => {}),
    );
    const loadingWrapper = await mountSuspended(CardDashboardTotalBadge, {
      global: { plugins: [pinia] },
    });
    expect(loadingWrapper.findComponent(SkeletonDashboardCard).exists()).toBe(
      true,
    );
  });

  it("should render correctly", () => {
    expect(cardDashboardTotalBadge.exists()).toBe(true);
  });

  it("should render the base dashboard card with awaited attributes(value and description)", () => {
    const cardDashboardBase =
      cardDashboardTotalBadge.findComponent(CardDashboardBase);
    expect(cardDashboardBase.props().value).toBe(178);
    expect(cardDashboardBase.exists()).toBe(true);
    expect(cardDashboardBase.props().description).toBe("total");
    expect(cardDashboardBase.props().link).toBe("/badge");
    expect(cardDashboardBase.props().linkLabel).toBe("viewAllBadges");
    expect(cardDashboardBase.findComponent(IconBadge).exists()).toBe(true);
  });

  it("renders the IconBadge in the icon slot", () => {
    const cardBase = cardDashboardTotalBadge.findComponent(CardDashboardBase);
    expect(cardBase.findComponent(IconBadge).exists()).toBe(true);
  });

  it("calls getTotalBadge and subscribes on mount", () => {
    expect(badgeStore.fetchBadgeCount).toHaveBeenCalled();
    expect(realtimeObserver.subscribe).toHaveBeenCalledWith({
      forEvents: ["INSERT", "DELETE"],
      onTable: "badges",
      withHandler: expect.any(Function),
    });
  });

  it("unsubscribes on unmount", async () => {
    cardDashboardTotalBadge.unmount();
    expect(realtimeObserver.unsubscribe).toHaveBeenCalledWith({
      forEvents: ["INSERT", "DELETE"],
      fromTable: "badges",
      withHandler: expect.any(Function),
    });
  });

  it("handler increments and decrements totalBadges on eventType", async () => {
    vi.useFakeTimers();

    const handler = cardDashboardTotalBadge.vm.handler;

    let cardDashboardBase =
      cardDashboardTotalBadge.findComponent(CardDashboardBase);
    expect(cardDashboardBase.props().value).toBe(178);

    handler({ eventType: "INSERT" });
    await cardDashboardTotalBadge.vm.$nextTick();
    cardDashboardBase =
      cardDashboardTotalBadge.findComponent(CardDashboardBase);
    expect(cardDashboardBase.props().value).toBe(179);

    handler({ eventType: "DELETE" });
    await cardDashboardTotalBadge.vm.$nextTick();
    cardDashboardBase =
      cardDashboardTotalBadge.findComponent(CardDashboardBase);
    expect(cardDashboardBase.props().value).toBe(178);

    vi.clearAllTimers();
    vi.useRealTimers();
  });
});
