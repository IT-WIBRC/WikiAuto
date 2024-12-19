import { beforeAll, describe, expect, it } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { BadgeRemovable, IconClose } from "#components";

describe("BadgeRemovable", () => {
  let badgeRemovableWrapper: VueWrapper;
  beforeAll(async () => {
    badgeRemovableWrapper = await mountSuspended(BadgeRemovable, {
      props: {
        text: "badge",
      },
    });
  });

  it("should render correctly", () => {
    expect(badgeRemovableWrapper.exists()).toBe(true);
  });

  it("should display the text", () => {
    expect(badgeRemovableWrapper.text()).toBe("badge");
  });

  it("should render the close icon", () => {
    expect(badgeRemovableWrapper.findComponent(IconClose).exists()).toBe(true);
  });

  it("should emit the `remove` event when we click on the close icon", async () => {
    await badgeRemovableWrapper.findComponent(IconClose).trigger("click");
    expect(badgeRemovableWrapper.emitted()).toHaveProperty("remove");
  });
});
