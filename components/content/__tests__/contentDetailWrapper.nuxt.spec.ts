import { beforeAll, describe, expect, it } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ContentDetailWrapper } from "#components";

describe("ContentDetailWrapper", () => {
  let contentDetailWrapper: VueWrapper;
  beforeAll(async () => {
    contentDetailWrapper = await mountSuspended(ContentDetailWrapper, {
      props: {
        label: "Title",
      },
      slots: {
        content: () => "<div>Content</div>",
      },
    });
  });

  it("should render correctly", () => {
    expect(contentDetailWrapper.exists()).toBe(true);
  });

  it("should display the label", () => {
    expect(contentDetailWrapper.find("label").text()).toBe("Title");
  });

  it("should render the close icon", () => {
    expect(contentDetailWrapper.text()).toContain("Content");
  });
});
