import { beforeAll, describe, expect, it } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { BaseButtonIcon } from "#components";

describe("BaseButtonIcon", () => {
  let baseButtonIcon: VueWrapper;
  beforeAll(async () => {
    baseButtonIcon = await mountSuspended(BaseButtonIcon, {
      props: {
        text: "Add content",
      },
      slots: {
        icon: "icon",
      },
    });
  });

  it("should render correctly", () => {
    expect(baseButtonIcon.exists()).toBe(true);
  });

  it("should display the text", () => {
    expect(baseButtonIcon.text()).toContain("Add content");
  });

  it("should render the icon", () => {
    expect(baseButtonIcon.text()).toContain("icon");
  });
});
