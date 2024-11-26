import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeAll, describe, expect, it } from "vitest";
import { InputEmail } from '#components';
import { VueWrapper } from "@vue/test-utils";

describe("InputEmail", () => {
    let inputEmailWrapper: VueWrapper;
    beforeAll(async () => {
        inputEmailWrapper = await mountSuspended(InputEmail, {
            props: {
                label: "Email",
                placeholder: "Enter your email",
                isRequired: false,
                modelValue: "email",
                error: "",  
            }
        });
    });

    it("should render correctly", () => {
        expect(inputEmailWrapper.exists()).toBe(true);
    });
});