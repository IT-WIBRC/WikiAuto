import { beforeAll, describe, expect, it } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { BaseDashboardCard } from "#components";

describe("BaseDashboardCard", () => {
  let baseDashboardCard: VueWrapper;
  beforeAll(async () => {
    baseDashboardCard = await mountSuspended(BaseDashboardCard, {
      props: {
        title: "178+",
        description: "Total contents",
      },
      slots: {
        icon: "<div data-cy='icon'>Icons</div>",
      },
    });
  });

  it("should render correctly", () => {
    expect(baseDashboardCard.exists()).toBe(true);
  });

  it("should display the card title", () => {
    expect(
      baseDashboardCard.find("[data-cy='dashboard-card-title']").text(),
    ).toBe("178+");
  });

  it("should display the card description", () => {
    expect(
      baseDashboardCard.find("[data-cy='dashboard-card-description']").text(),
    ).toBe("Total contents");
  });

  it("should display the card icon", () => {
    expect(baseDashboardCard.find("[data-cy='icon']").text()).toBe("Icons");
  });
});
