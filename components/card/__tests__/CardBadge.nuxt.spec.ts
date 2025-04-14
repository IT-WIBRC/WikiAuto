import { beforeAll, describe, expect, it } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { CardBadge, IconEdit } from "#components";

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

  it("should render the edit button with awaited icon", () => {
    const editBtn = cardBadge.find("[data-cy='edit-btn']");
    expect(editBtn.exists()).toBe(true);
    expect(editBtn.findComponent(IconEdit).exists()).toBe(true);
  });

  it("should display the awaited placeholder description when it's not provided ", async () => {
    cardBadge = await mountSuspended(CardBadge, {
      props: {
        title: "No data created yet!!",
      },
    });
    expect(cardBadge.find("[data-cy='description']").text()).toBe(
      "Description",
    );
  });

  it("should emit the 'wantEdit' event when we click on the edit button", async () => {
    await cardBadge.find("[data-cy='edit-btn']").trigger("click");
    expect(cardBadge.emitted()).toHaveProperty("wantEdit");
  });
});
