import { beforeAll, describe, expect, it, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { CardDashboardBase, NuxtLink } from "#components";

describe("CardDashboardBase", () => {
  let cardDashboardBase: VueWrapper;
  beforeAll(async () => {
    vi.spyOn(console, "warn");
    cardDashboardBase = await mountSuspended(CardDashboardBase, {
      props: {
        value: 178,
        description: "Total contents",
      },
      slots: {
        icon: () => "<div data-cy='icon'>Icons</div>",
      },
    });
  });

  it("should render correctly", () => {
    expect(cardDashboardBase.exists()).toBe(true);
  });

  it("should display the card value", () => {
    expect(
      cardDashboardBase.find("[data-cy='dashboard-card-value']").text(),
    ).toBe("178");
  });

  it("should display the card description", () => {
    expect(
      cardDashboardBase.find("[data-cy='dashboard-card-description']").text(),
    ).toBe("Total contents");
  });

  it("should display the card icon", () => {
    expect(cardDashboardBase.text()).toContain("Icons");
  });

  it("does not render NuxtLink if link prop is not provided", async () => {
    cardDashboardBase = await mountSuspended(CardDashboardBase, {
      props: {
        value: 1,
        description: "desc",
      },
    });
    expect(cardDashboardBase.findComponent(NuxtLink).exists()).toBe(false);
  });

  it("renders NuxtLink with correct props and label if link is provided", async () => {
    cardDashboardBase = await mountSuspended(CardDashboardBase, {
      props: {
        value: 10,
        description: "desc",
        link: "/badge",
        linkLabel: "View all badges",
      },
    });
    const link = cardDashboardBase.findComponent(NuxtLink);
    expect(link.exists()).toBe(true);
    expect(link.props("to")).toBe("/badge");
    expect(link.text()).toContain("View all badges");
    expect(link.text()).toContain("→");
  });
});
