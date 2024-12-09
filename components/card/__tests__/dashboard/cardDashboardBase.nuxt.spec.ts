import { beforeAll, describe, expect, it, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { CardDashboardBase } from "#components";

describe("CardDashboardBase", () => {
  let cardDashboardBase: VueWrapper;
  beforeAll(async () => {
    vi.spyOn(console, "warn");
    cardDashboardBase = await mountSuspended(CardDashboardBase, {
      props: {
        value: "178+",
        description: "Total contents",
      },
      slots: {
        icon: "<div data-cy='icon'>Icons</div>",
      },
    });
  });

  it("should render correctly", () => {
    expect(cardDashboardBase.exists()).toBe(true);
  });

  it("should display the card value", () => {
    expect(
      cardDashboardBase.find("[data-cy='dashboard-card-value']").text(),
    ).toBe("178+");
  });

  it("should display the card description", () => {
    expect(
      cardDashboardBase.find("[data-cy='dashboard-card-description']").text(),
    ).toBe("Total contents");
  });

  it("should display the card icon", () => {
    expect(cardDashboardBase.find("[data-cy='icon']").text()).toBe("Icons");
  });
});
