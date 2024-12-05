import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { LoaderFade } from "#components";

describe("LoaderFade", () => {
  it("should render correctly", async () => {
    const fadeWrapper = await mountSuspended(LoaderFade);
    expect(fadeWrapper.exists()).toBe(true);
  });
});
