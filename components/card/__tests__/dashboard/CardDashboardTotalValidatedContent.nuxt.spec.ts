import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import {
  CardDashboardBase,
  CardDashboardTotalValidatedContent,
  IconValidated,
} from "#components";
import { useContentStore } from "~/stores/content.store";
import useUnitTestUtils from "~/utils/useUnitTestUtils";

describe("CardDashboardTotalValidatedContent", () => {
  const pinia = useUnitTestUtils.getPiniaInstance({ stubActions: true });

  const contentStore = useContentStore(pinia);
  contentStore.fetchTotalContentValidated = vi.fn().mockReturnValue({
    status: "success",
    data: 170,
  });

  let cardDashboardTotalValidatedContent: VueWrapper;
  beforeAll(async () => {
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
    expect(cardDashboardBase.props().value).toBe("170");
    expect(cardDashboardBase.props().description).toBe("totalValidated");
    expect(cardDashboardBase.findComponent(IconValidated).exists()).toBe(true);
  });
});
