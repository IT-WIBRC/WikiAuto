import { mountSuspended } from "@nuxt/test-utils/runtime";
import {beforeAll, describe, expect, it } from "vitest";
import {IconEyeClosed, IconEyeOpen, InputPassword} from "#components";
import { VueWrapper } from "@vue/test-utils";

describe("InputPassword", () => {
    let inputPasswordWrapper: VueWrapper;
    beforeAll(async () => {
        inputPasswordWrapper = await mountSuspended(InputPassword, {
            props: {
                label: "Password",
                placeholder: "Enter your password",
                isRequired: false,
                modelValue: "",
            }
        });
    });

    it("should render correctly", () => {
        expect(inputPasswordWrapper.exists()).toBe(true);
    });

    it("should display the label", () => {
        expect(inputPasswordWrapper.find("label").text()).toBe("Password");
    });

    it("should display the placeholder", () => {
        expect(inputPasswordWrapper.find("input").element.placeholder).toBe(
            "Enter your password"
        );
    });

    it("should not be required when 'isRequired' is False", () => {
        expect(inputPasswordWrapper.find("input").element.required).toBe(false);
    });

    it("should display the error when present", async () => {
        let emailError = inputPasswordWrapper.find("[data-test='error']");
        expect(emailError.exists()).toBe(false);
        inputPasswordWrapper = await mountSuspended(InputPassword, {
            props: {
                label: "Password",
                placeholder: "Enter your password",
                isRequired: false,
                modelValue: "",
                errorMessage: "Must be an email"
            }
        });
        emailError = inputPasswordWrapper.find("[data-test='error']");
        expect(emailError.exists()).toBe(true);
        expect(emailError.text()).toBe("Must be an email");
    });

    it("should have the awaited style when it has an error", async () => {
        inputPasswordWrapper = await mountSuspended(InputPassword, {
            props: {
                label: "Password",
                placeholder: "Enter your password",
                isRequired: false,
                modelValue: "",
            }
        });
        expect(inputPasswordWrapper.find("input").attributes().class).toContain(
            "bg-white border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        );
        await inputPasswordWrapper.setProps({
            hasError: true,
        });
        expect(inputPasswordWrapper.find("input").attributes().class).toContain(
            "bg-[#96001829] border-none"
        );
    });

    it("should display the `*` when the field is required", async () => {
        inputPasswordWrapper = await mountSuspended(InputPassword, {
            props: {
                label: "Password",
                placeholder: "Enter your password",
                isRequired: false,
                modelValue: "",
            }
        });
        let wildcards = inputPasswordWrapper.find("[data-test='wildcard']");
        expect(wildcards.exists()).toBe(false);
        await inputPasswordWrapper.setProps({
            isRequired: true,
        });
        wildcards = inputPasswordWrapper.find("[data-test='wildcard']");
        expect(wildcards.exists()).toBe(true);
        expect(wildcards.text()).toBe("*");
    });

    it("should show/hide the text when we click on the show/hide button", async () => {
        let showPassword = inputPasswordWrapper.find("[data-test='show']");
        let hidePassword = inputPasswordWrapper.find("[data-test='hide']");

        expect(showPassword.exists()).toBe(true);
        expect(hidePassword.exists()).toBe(false);

        expect(showPassword.findComponent(IconEyeClosed).exists()).toBe(true);
        await showPassword.trigger("click");

        hidePassword = inputPasswordWrapper.find("[data-test='hide']");
        showPassword = inputPasswordWrapper.find("[data-test='show']");

        expect(showPassword.exists()).toBe(false);
        expect(hidePassword.exists()).toBe(true);

        expect(hidePassword.findComponent(IconEyeOpen).exists()).toBe(true);

        await hidePassword.trigger("click");

        hidePassword = inputPasswordWrapper.find("[data-test='hide']");
        showPassword = inputPasswordWrapper.find("[data-test='show']");

        expect(showPassword.exists()).toBe(true);
        expect(hidePassword.exists()).toBe(false);
    });

    it.skip("should emit the value typed", async () => {
        inputPasswordWrapper = await mountSuspended(InputPassword, {
            props: {
                label: "Password",
                placeholder: "Enter your password",
                isRequired: false,
                modelValue: "",
            }
        });
        await inputPasswordWrapper.find("input").setValue("wibrc@");
        expect(inputPasswordWrapper.emitted()).toHaveProperty("update:modelValue", [
            ["wibrc@"],
        ]);
    });
});