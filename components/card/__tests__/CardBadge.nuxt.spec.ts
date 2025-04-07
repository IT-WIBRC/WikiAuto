import { beforeAll, describe, expect, it } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { CardBadge } from "#components";

describe("CardBadge", () => {
  let cardBadge: VueWrapper;
  beforeAll(async () => {
    cardBadge = await mountSuspended(CardBadge, {
      props: {
        title: "No data created yet!!",
        description: "My description",
      },
    });
  });

  it("should render correctly", () => {
    expect(cardBadge.exists()).toBe(true);
  });

  it("should display the title correctly", () => {
    expect(cardBadge.find("[data-cy='title']").text()).toBe(
      "No data created yet!!",
    );
  });

  it("should render the blank icon correctly", () => {
    expect(cardBadge.find("[data-cy='description']").text()).toBe(
      "My description",
    );
  });
});
