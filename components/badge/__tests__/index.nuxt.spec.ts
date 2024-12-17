import { beforeAll, describe, expect, it } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { Badge } from "#components";

describe("Badge", () => {
  let badgeWrapper: VueWrapper;
  beforeAll(async () => {
    badgeWrapper = await mountSuspended(Badge, {
      props: {
        text: "badge",
      },
    });
  });

  it("should render correctly", () => {
    expect(badgeWrapper.exists()).toBe(true);
  });

  it("should display the text", () => {
    expect(badgeWrapper.text()).toBe("badge");
  });
});
