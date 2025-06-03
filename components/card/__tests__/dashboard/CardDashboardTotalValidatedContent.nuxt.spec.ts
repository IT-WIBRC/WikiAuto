import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import {
  CardDashboardBase,
  CardDashboardTotalValidatedContent,
  IconValidated,
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

describe("CardDashboardTotalValidatedContent", () => {
  const pinia = useUnitTestUtils.getPiniaInstance({ stubActions: true });

  const contentStore = useContentStore(pinia);
  contentStore.fetchTotalContentValidated = vi.fn().mockReturnValue({
    status: "success",
    data: 170,
  });

  let cardDashboardTotalValidatedContent: VueWrapper;
  beforeEach(async () => {
    cardDashboardTotalValidatedContent = await mountSuspended(
      CardDashboardTotalValidatedContent,
      {
        global: {
          plugins: [pinia],
        },
      },
    );
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("should render correctly", () => {
    expect(cardDashboardTotalValidatedContent.exists()).toBe(true);
  });

  it("should render the base dashboard card with awaited attributes", () => {
    const cardDashboardBase =
      cardDashboardTotalValidatedContent.findComponent(CardDashboardBase);
    expect(cardDashboardBase.exists()).toBe(true);
    expect(cardDashboardBase.props().value).toBe(170);
    expect(cardDashboardBase.props().description).toBe("totalValidated");
    expect(cardDashboardBase.findComponent(IconValidated).exists()).toBe(true);
  });

  it("shows loading skeleton while loading", async () => {
    contentStore.fetchTotalContentValidated.mockImplementationOnce(
      () => new Promise(() => {}),
    );
    const loadingWrapper = await mountSuspended(
      CardDashboardTotalValidatedContent,
      {
        global: { plugins: [pinia] },
      },
    );
    expect(loadingWrapper.findComponent(SkeletonDashboardCard).exists()).toBe(
      true,
    );
  });

  it("calls fetchTotalContentValidated and subscribes on mount", () => {
    expect(contentStore.fetchTotalContentValidated).toHaveBeenCalled();
    expect(realtimeObserver.subscribe).toHaveBeenCalledWith({
      forEvents: ["INSERT", "UPDATE"],
      onTable: "contents",
      withHandler: expect.any(Function),
    });
  });

  it("unsubscribes on unmount", async () => {
    cardDashboardTotalValidatedContent.unmount();
    expect(realtimeObserver.unsubscribe).toHaveBeenCalledWith({
      forEvents: ["INSERT", "UPDATE"],
      fromTable: "contents",
      withHandler: expect.any(Function),
    });
  });

  it("handler increments and decrements totalValidatedContent on eventType (DOM update)", async () => {
    const handler = cardDashboardTotalValidatedContent.vm.handler;

    let cardDashboardBase =
      cardDashboardTotalValidatedContent.findComponent(CardDashboardBase);
    expect(cardDashboardBase.props().value).toBe(170);

    handler({ eventType: "INSERT", new: { status: "VALIDATED" } });
    await cardDashboardTotalValidatedContent.vm.$nextTick();
    cardDashboardBase =
      cardDashboardTotalValidatedContent.findComponent(CardDashboardBase);
    expect(cardDashboardBase.props().value).toBe(171);

    handler({
      eventType: "UPDATE",
      old: { status: "DRAFT" },
      new: { status: "VALIDATED" },
    });
    await cardDashboardTotalValidatedContent.vm.$nextTick();
    cardDashboardBase =
      cardDashboardTotalValidatedContent.findComponent(CardDashboardBase);
    expect(cardDashboardBase.props().value).toBe(172);

    handler({
      eventType: "UPDATE",
      old: { status: "VALIDATED" },
      new: { status: "ARCHIVED" },
    });
    await cardDashboardTotalValidatedContent.vm.$nextTick();
    cardDashboardBase =
      cardDashboardTotalValidatedContent.findComponent(CardDashboardBase);
    expect(cardDashboardBase.props().value).toBe(171);
  });
});
