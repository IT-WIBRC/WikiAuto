import { describe, expect, it } from "vitest";
import useImageAsset from "../use-image-asset";

describe("UseImageAsset", () => {
  it("should return the full image path when the image exists", () => {
    const image = useImageAsset("wikiAuto.png");
    expect(image).toBe("/assets/images/wikiAuto.png");
  });

  it("should return undefined when the image does not exist", () => {
    const image = useImageAsset("wikiAutoto.png");
    expect(image).toBeUndefined();
  });

  it("should return undefined when the image does not have an extension", () => {
    const image = useImageAsset("wikiAuto");
    expect(image).toBeUndefined();
  });

  it("should return undefined when the image ha the wrong extension", () => {
    const image = useImageAsset("wikiAuto.jpeg");
    expect(image).toBeUndefined();
  });
});
