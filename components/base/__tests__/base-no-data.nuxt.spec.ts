import { beforeAll, describe, expect, it } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { BaseNoData, IconBlankContent } from "#components";

describe("BaseNoData", () => {
  let baseNoData: VueWrapper;
  beforeAll(async () => {
    baseNoData = await mountSuspended(BaseNoData, {
      props: {
        message: "No data created yet!!",
      },
    });
  });

  it("should render correctly", () => {
    expect(baseNoData.exists()).toBe(true);
  });

  it("should display the message correctly", () => {
    expect(baseNoData.find("[data-cy='no-content']").text()).toBe(
      "No data created yet!!",
    );
  });

  it("should render the blank icon correctly", () => {
    expect(baseNoData.findComponent(IconBlankContent).exists()).toBe(true);
  });

  it("should display the icon when changed", async () => {
    baseNoData = await mountSuspended(BaseNoData, {
      props: {
        message: "No data created yet!!",
      },
      slots: {
        icon: "<span>icon changed</span>",
      },
    });

    expect(baseNoData.html()).toContain("<span>icon changed</span>");
  });
});
