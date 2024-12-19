import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeAll, describe, expect, it } from "vitest";
import { InputPassword, InputText } from "#components";
import type { VueWrapper } from "@vue/test-utils";

describe("InputText", () => {
  let inputTextWrapperText: VueWrapper;
  beforeAll(async () => {
    inputTextWrapperText = await mountSuspended(InputText, {
      props: {
        label: "Text",
        placeholder: "Enter your text",
        isRequired: false,
        modelValue: "",
      },
    });
  });

  it("should render correctly", () => {
    expect(inputTextWrapperText.exists()).toBe(true);
  });

  it("should display the label", () => {
    expect(inputTextWrapperText.find("label").text()).toBe("Text");
  });

  it("should display the placeholder", () => {
    expect(inputTextWrapperText.find("input").element.placeholder).toBe(
      "Enter your text",
    );
  });

  it("should not be required when 'isRequired' is False", () => {
    expect(inputTextWrapperText.find("input").element.required).toBe(false);
  });

  it("should display the error when present", async () => {
    let emailError = inputTextWrapperText.find("[data-test='error']");
    expect(emailError.exists()).toBe(false);
    inputTextWrapperText = await mountSuspended(InputText, {
      props: {
        label: "Text",
        placeholder: "Enter your text",
        isRequired: false,
        modelValue: "",
        errorMessage: "Must be an text",
      },
    });
    emailError = inputTextWrapperText.find("[data-test='error']");
    expect(emailError.exists()).toBe(true);
    expect(emailError.text()).toBe("Must be an text");
  });

  it("should have the awaited style when it has an error", async () => {
    inputTextWrapperText = await mountSuspended(InputText, {
      props: {
        label: "Text",
        placeholder: "Enter your text",
        isRequired: false,
        modelValue: "",
      },
    });
    expect(inputTextWrapperText.find("input").attributes().class).toContain(
      "bg-[#F1F4FA] focus:border-sky-500 focus:ring-1 focus:ring-sky-500",
    );
    await inputTextWrapperText.setProps({
      hasError: true,
    });
    expect(inputTextWrapperText.find("input").attributes().class).toContain(
      "bg-[#96001829] border-none",
    );
  });

  it("should display the `*` when the field is required", async () => {
    inputTextWrapperText = await mountSuspended(InputText, {
      props: {
        label: "Text",
        placeholder: "Enter your text",
        isRequired: false,
        modelValue: "",
      },
    });
    let wildcards = inputTextWrapperText.find("[data-test='wildcard']");
    expect(wildcards.exists()).toBe(false);
    await inputTextWrapperText.setProps({
      isRequired: true,
    });
    wildcards = inputTextWrapperText.find("[data-test='wildcard']");
    expect(wildcards.exists()).toBe(true);
    expect(wildcards.text()).toBe("*");
  });

  it("should not display the number of character typed / the limit of character", async () => {
    expect(inputTextWrapperText.find("[data-cy='evolution']").exists()).toBe(
      false,
    );
  });

  it("should emit the value typed", async () => {
    inputTextWrapperText = await mountSuspended(InputPassword, {
      props: {
        label: "Text",
        placeholder: "Enter your text",
        isRequired: false,
        modelValue: "",
      },
    });
    await inputTextWrapperText.find("input").setValue("wibrc");
    expect(inputTextWrapperText.emitted()).toHaveProperty("update:modelValue", [
      ["wibrc"],
    ]);
  });

  describe("Input text with character limit", () => {
    beforeAll(async () => {
      inputTextWrapperText = await mountSuspended(InputText, {
        props: {
          label: "Text",
          placeholder: "Enter your text",
          isRequired: false,
          modelValue: "",
          limitCharacter: 20,
        },
      });
    });

    it("should render correctly", () => {
      expect(inputTextWrapperText.exists()).toBe(true);
    });

    it("should display the number of character typed including the spaces / the limit of character", async () => {
      expect(inputTextWrapperText.find("[data-cy='evolution']").text()).toBe(
        "0/20",
      );
      await inputTextWrapperText.find("input").setValue("My value is here");
      expect(inputTextWrapperText.find("[data-cy='evolution']").text()).toBe(
        "16/20",
      );

      expect(inputTextWrapperText.emitted()).toHaveProperty(
        "update:modelValue",
        [["My value is here"]],
      );
    });
  });
});
