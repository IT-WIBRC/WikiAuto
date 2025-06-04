import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import {
  SectionProfile,
  InputText,
  InputEmail,
  BaseButtonIcon,
} from "#components";
import useUnitTestUtils from "~/utils/useUnitTestUtils";
import type { User } from "@supabase/auth-js";

// Mock Pinia user store
const pinia = useUnitTestUtils.getPiniaInstance({ stubActions: true });
const userStore = useUserStore(pinia);
userStore.currentUser = {
  user_metadata: {
    firstname: "John",
    lastname: "Doe",
    username: "johndoe",
  },
  email: "john@example.com",
} as unknown as User;

describe("SectionProfile", () => {
  let sectionProfileWrapper: VueWrapper;

  beforeEach(async () => {
    sectionProfileWrapper = await mountSuspended(SectionProfile, {
      global: {
        plugins: [pinia],
      },
    });
  });

  afterAll(() => {
    vi.resetModules();
  });

  it("should render correctly", () => {
    expect(sectionProfileWrapper.exists()).toBe(true);
  });

  it("renders section title and description using i18n keys", () => {
    expect(sectionProfileWrapper.text()).toContain("ttl");
    expect(sectionProfileWrapper.text()).toContain("desc");
  });

  it("renders all input fields with correct i18n label keys and values", () => {
    const inputTexts = sectionProfileWrapper.findAllComponents(InputText);
    const inputEmail = sectionProfileWrapper.findComponent(InputEmail);

    expect(inputTexts.length).toBe(3);
    expect(inputTexts[0].props("label")).toBe("name.first");
    expect(inputTexts[1].props("label")).toBe("name.last");
    expect(inputTexts[2].props("label")).toBe("name.user");
    expect(inputTexts[0].props("modelValue")).toBe("John");
    expect(inputTexts[1].props("modelValue")).toBe("Doe");
    expect(inputTexts[2].props("modelValue")).toBe("johndoe");
    expect(inputTexts[0].props("isRequired")).toBe(false);
    expect(inputTexts[1].props("isRequired")).toBe(false);
    expect(inputTexts[2].props("isRequired")).toBe(false);

    expect(inputEmail.exists()).toBe(true);
    expect(inputEmail.props("label")).toBe("email");
    expect(inputEmail.props("modelValue")).toBe("john@example.com");
    expect(inputEmail.props("isDisabled")).toBe(true);
    expect(inputEmail.props("isRequired")).toBe(false);
  });

  it("renders the save button with correct i18n label key", () => {
    const button = sectionProfileWrapper.findComponent(BaseButtonIcon);
    expect(button.exists()).toBe(true);
    expect(button.props("text")).toBe("btn.save");
  });

  it("disables the save button if no changes are made", () => {
    const button = sectionProfileWrapper.findComponent(BaseButtonIcon);
    expect(button.element.disabled).toBe(true);
  });

  it("enables the save button if a field is changed", async () => {
    const input = sectionProfileWrapper.findAllComponents(InputText)[0];
    await input.vm.$emit("update:modelValue", "Jane");
    await sectionProfileWrapper.vm.$nextTick();
    const button = sectionProfileWrapper.findComponent(BaseButtonIcon);
    expect(button.element.disabled).toBe(false);
  });
});
