import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeAll, describe, expect, it } from "vitest";
import { InputEmail } from "#components";
import type { VueWrapper } from "@vue/test-utils";

describe("InputEmail", () => {
  let inputEmailWrapper: VueWrapper;
  beforeAll(async () => {
    inputEmailWrapper = await mountSuspended(InputEmail, {
      props: {
        label: "Email",
        placeholder: "Enter your email",
        isRequired: false,
        modelValue: "",
      },
    });
  });

  it("should render correctly", () => {
    expect(inputEmailWrapper.exists()).toBe(true);
  });

  it("should display the label", () => {
    expect(inputEmailWrapper.find("label").text()).toBe("Email");
  });

  it("should display the placeholder", () => {
    expect(inputEmailWrapper.find("input").element.placeholder).toBe(
      "Enter your email",
    );
  });

  it("should not be required when 'isRequired' is False", () => {
    expect(inputEmailWrapper.find("input").element.required).toBe(false);
  });

  it("should display the error when present", async () => {
    let emailError = inputEmailWrapper.find("[data-test='error']");
    expect(emailError.exists()).toBe(false);
    inputEmailWrapper = await mountSuspended(InputEmail, {
      props: {
        label: "Email",
        placeholder: "Enter your email",
        isRequired: false,
        modelValue: "",
        errorMessage: "Must be an email",
      },
    });
    emailError = inputEmailWrapper.find("[data-test='error']");
    expect(emailError.exists()).toBe(true);
    expect(emailError.text()).toBe("Must be an email");
  });

  it("should have the awaited style when it has an error", async () => {
    inputEmailWrapper = await mountSuspended(InputEmail, {
      props: {
        label: "Email",
        placeholder: "Enter your email",
        isRequired: false,
        modelValue: "",
      },
    });
    expect(inputEmailWrapper.find("input").attributes().class).toContain(
      "bg-white border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500",
    );
    await inputEmailWrapper.setProps({
      hasError: true,
    });
    expect(inputEmailWrapper.find("input").attributes().class).toContain(
      "bg-[#96001829] border-none",
    );
  });

  it("should display the `*` when the field is required", async () => {
    inputEmailWrapper = await mountSuspended(InputEmail, {
      props: {
        label: "Email",
        placeholder: "Enter your email",
        isRequired: false,
        modelValue: "",
      },
    });
    let wildcards = inputEmailWrapper.find("[data-test='wildcard']");
    expect(wildcards.exists()).toBe(false);
    await inputEmailWrapper.setProps({
      isRequired: true,
    });
    wildcards = inputEmailWrapper.find("[data-test='wildcard']");
    expect(wildcards.exists()).toBe(true);
    expect(wildcards.text()).toBe("*");
  });

  it.skip("should emit the value typed", async () => {
    inputEmailWrapper = await mountSuspended(InputEmail, {
      props: {
        label: "Email",
        placeholder: "Enter your email",
        isRequired: false,
        modelValue: "",
      },
    });
    await inputEmailWrapper.find("input").setValue("wibrc@");
    expect(inputEmailWrapper.emitted()).toHaveProperty("update:modelValue", [
      ["wibrc@"],
    ]);
  });
});
