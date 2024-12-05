import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeAll, describe, expect, it } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { BaseImage } from "#components";

describe("BaseImage", () => {
  let baseImageWrapper: VueWrapper;
  beforeAll(async () => {
    baseImageWrapper = await mountSuspended(BaseImage, {
      props: {
        name: "",
      },
    });
  });

  it("should render correctly", async () => {
    expect(baseImageWrapper.exists()).toBe(true);
  });

  it("should content the awaited alternative", () => {
    expect(baseImageWrapper.attributes("src")).toBeUndefined();
    expect(baseImageWrapper.attributes("alt")).toBe(
      "The image provided is not right",
    );
  });

  it("should content the default priority", () => {
    expect(baseImageWrapper.attributes("fetchpriority")).toBe("auto");
  });

  it("should content the default loading strategy", () => {
    expect(baseImageWrapper.attributes("loading")).toBe("lazy");
  });

  it("should content the awaited alternative when provided", async () => {
    baseImageWrapper = await mountSuspended(BaseImage, {
      props: {
        alt: "my custom alt",
        name: "",
      },
    });
    expect(baseImageWrapper.attributes("alt")).toBe("my custom alt");
  });

  it("should content the awaited loading when provided", async () => {
    baseImageWrapper = await mountSuspended(BaseImage, {
      props: {
        loading: "eager",
        name: "",
      },
    });
    expect(baseImageWrapper.attributes("loading")).toBe("eager");
  });

  it("should content the awaited priority when provided", async () => {
    baseImageWrapper = await mountSuspended(BaseImage, {
      props: {
        fetchPriority: "high",
        name: "",
      },
    });
    expect(baseImageWrapper.attributes("fetchpriority")).toBe("high");

    await baseImageWrapper.setProps({
      fetchPriority: "low",
    });

    expect(baseImageWrapper.attributes("fetchpriority")).toBe("low");
  });

  it("should content the awaited image src when the name is provided", async () => {
    baseImageWrapper = await mountSuspended(BaseImage, {
      props: {
        name: "wikiAuto.png",
      },
    });
    expect(baseImageWrapper.attributes("src")).toBe(
      "/assets/images/wikiAuto.png",
    );
  });

  it("should have the awaited image src undefined when the name provided is incorrect or the image missing", async () => {
    baseImageWrapper = await mountSuspended(BaseImage, {
      props: {
        name: "wikiAuto",
      },
    });
    expect(baseImageWrapper.attributes("src")).toBeUndefined();
  });
});
