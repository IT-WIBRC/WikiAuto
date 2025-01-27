import { beforeAll, describe, expect, it, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { IconImage, InputFileImage } from "#components";

describe("InputFileImage", () => {
  let inputFileImage: VueWrapper;
  beforeAll(async () => {
    inputFileImage = await mountSuspended(InputFileImage, {
      props: {
        label: "Illustration",
        modelValue: new File([""], ""),
      },
    });
  });

  it("should render correctly", () => {
    expect(inputFileImage.exists()).toBe(true);
  });

  it("should display the label as title", () => {
    expect(inputFileImage.find("[data-cy='image-content']").element.title).toBe(
      "Illustration",
    );
  });

  it("should render the image icon when there is no image uploaded yet", () => {
    const imageShape = inputFileImage.find("[data-cy='image-shape']");
    expect(imageShape.exists()).toBe(true);
    expect(imageShape.attributes().class).toContain("bg-[#F1F4FA]");
    expect(imageShape.findComponent(IconImage).exists()).toBe(true);
  });

  it("should render the file input", () => {
    const fileInput = inputFileImage.find("input");
    expect(fileInput.exists()).toBe(true);
    expect(fileInput.element.hidden).toBe(true);
    expect(fileInput.element.type).toBe("file");
    expect(fileInput.element.accept).toBe("image/*");
  });

  it("should load the file when loaded", async () => {
    expect(inputFileImage.findComponent(IconImage).exists()).toBe(true);
    const file = {
      name: "logo.png",
      size: 70162,
      type: "image/png",
    } as File;

    const reader = {
      readAsArrayBuffer: vi.fn(),
      onload: vi.fn,
      onerror: vi.fn(),
      result: new Blob(["http://image-url.png"], { type: "image/png" }),
    };

    const input = inputFileImage.find("input[type='file']");
    Object.defineProperty(input.element, "files", {
      value: [file],
      writable: false,
    });

    global.URL.createObjectURL = vi.fn(() => "http://image-url.png");
    vi.spyOn(window, "FileReader").mockReturnValueOnce(
      reader as unknown as FileReader,
    );
    await input.trigger("change");
    reader.onload();

    expect(inputFileImage.find("img").element.src).toBe(
      "http://image-url.png/",
    );
    expect(inputFileImage.emitted()).toHaveProperty("update:modelValue", [
      [file],
    ]);
  });

  it("should display the error message when provided", async () => {
    let errorMessage = inputFileImage.find("[data-cy='error']");
    expect(errorMessage.exists()).toBe(false);
    inputFileImage = await mountSuspended(InputFileImage, {
      props: {
        label: "Illustration",
        modelValue: new File([], ""),
        errorMessage: "Max size is 200kb",
      },
    });
    errorMessage = inputFileImage.find("[data-cy='error']");
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe("Max size is 200kb");
  });
});
