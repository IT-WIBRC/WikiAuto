import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import {
  CardDashboardBase,
  CardDashboardTotalContent,
  IconContent,
  SkeletonDashboardCard,
} from "#components";
import { useContentStore } from "~/stores/content.store";
import useUnitTestUtils from "~/utils/useUnitTestUtils";
import { realtimeObserver } from "~/api/realtime/realtimeObserver";

vi.mock("~/api/realtime/realtimeObserver", () => ({
  realtimeObserver: {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  },
}));

describe("CardDashboardTotalContent", () => {
  const pinia = useUnitTestUtils.getPiniaInstance({ stubActions: true });

  const contentStore = useContentStore(pinia);
  contentStore.fetchTotalContent = vi.fn().mockReturnValue({
    status: "success",
    data: 178,
  });

  let cardDashboardTotalContent: VueWrapper;
  beforeEach(async () => {
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

  it("shows loading skeleton while loading", async () => {
    contentStore.fetchTotalContent.mockImplementationOnce(
      () => new Promise(() => {}),
    );
    const loadingWrapper = await mountSuspended(CardDashboardTotalContent, {
      global: { plugins: [pinia] },
    });
    expect(loadingWrapper.findComponent(SkeletonDashboardCard).exists()).toBe(
      true,
    );
  });

  it("should render the base dashboard card with awaited attributes", () => {
    const cardDashboardBase =
      cardDashboardTotalContent.findComponent(CardDashboardBase);
    expect(cardDashboardBase.exists()).toBe(true);
    expect(cardDashboardBase.props().value).toBe(178);
    expect(cardDashboardBase.props().description).toBe("total");
    expect(cardDashboardBase.props().link).toBe("/content");
    expect(cardDashboardBase.props().linkLabel).toBe("viewAllContents");
    expect(cardDashboardBase.findComponent(IconContent).exists()).toBe(true);
  });

  it("calls fetchTotalContent and subscribes on mount", () => {
    expect(contentStore.fetchTotalContent).toHaveBeenCalled();
    expect(realtimeObserver.subscribe).toHaveBeenCalledWith({
      forEvents: ["INSERT", "DELETE"],
      onTable: "contents",
      withHandler: expect.any(Function),
    });
  });

  it("unsubscribes on unmount", async () => {
    cardDashboardTotalContent.unmount();
    expect(realtimeObserver.unsubscribe).toHaveBeenCalledWith({
      forEvents: ["INSERT", "DELETE"],
      fromTable: "contents",
      withHandler: expect.any(Function),
    });
  });

  it("handler increments and decrements totalContent on eventType (DOM update)", async () => {
    const handler = cardDashboardTotalContent.vm.handler;

    let cardDashboardBase =
      cardDashboardTotalContent.findComponent(CardDashboardBase);
    expect(cardDashboardBase.props().value).toBe(178);

    handler({ eventType: "INSERT" });
    await cardDashboardTotalContent.vm.$nextTick();
    cardDashboardBase =
      cardDashboardTotalContent.findComponent(CardDashboardBase);
    expect(cardDashboardBase.props().value).toBe(179);

    handler({ eventType: "DELETE" });
    await cardDashboardTotalContent.vm.$nextTick();
    cardDashboardBase =
      cardDashboardTotalContent.findComponent(CardDashboardBase);
    expect(cardDashboardBase.props().value).toBe(178);
  });
});
