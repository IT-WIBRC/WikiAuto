import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeAll, describe, expect, it } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { AlertError } from "#components";

describe("AlertError", () => {
  let alertErrorWrapper: VueWrapper;
  beforeAll(async () => {
    alertErrorWrapper = await mountSuspended(AlertError, {
      props: {
        message: "Api error (Method not implemented)",
      },
    });
  });

  it("should render correctly", async () => {
    expect(alertErrorWrapper.exists()).toBe(true);
  });

  it("should display the message", async () => {
    expect(alertErrorWrapper.text()).toBe("Api error (Method not implemented)");
  });
});
