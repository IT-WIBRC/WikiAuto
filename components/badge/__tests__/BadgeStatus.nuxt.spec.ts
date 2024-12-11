import { beforeAll, describe, expect, it } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { BadgeStatus } from "#components";

describe("BadgeStatus", () => {
  let badgeStatusWrapper: VueWrapper;
  beforeAll(async () => {
    badgeStatusWrapper = await mountSuspended(BadgeStatus, {
      props: {
        text: "badge",
        theme: "validated",
      },
    });
  });

  it("should render correctly", () => {
    expect(badgeStatusWrapper.exists()).toBe(true);
  });

  it("should display the text with awaited style", () => {
    const title = badgeStatusWrapper.find("[data-cy='badge-title']");
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe("badge");
    expect(title.attributes().class).toContain("text-[#03A89E]/80");
  });

  it("should display the circle before the text", () => {
    const circle = badgeStatusWrapper.find("[data-cy='badge-circle']");
    expect(circle.exists()).toBe(true);
    expect(circle.attributes().class).toContain("bg-[#03A89E]");
  });
});
