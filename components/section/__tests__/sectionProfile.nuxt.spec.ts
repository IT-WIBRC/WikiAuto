import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, type VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import {
  SectionProfile,
  InputText,
  InputEmail,
  BaseButtonIcon,
} from "#components";
import { useUserStore } from "~/stores/user.store";
import { nextTick } from "vue";
import testUtils from "~/tests/utils/ui";
import { GenericErrors } from "~/api";
import { getMockUseToastInstance } from "~/tests/mocks/mockUseToast";

const { getPiniaInstance, toastAssertions } = testUtils;
const mockUseToast = getMockUseToastInstance();

vi.mock("~/composables/useToast", () => ({
  useToast: vi.fn(() => mockUseToast),
}));

describe("SectionProfile", () => {
  let profileWrapper: VueWrapper;
  let userStore: ReturnType<typeof useUserStore>;
  const pinia = getPiniaInstance({ stubActions: false });

  beforeEach(async () => {
    mockUseToast.reset();
    userStore = useUserStore();
    userStore.currentUser = {
      id: "id1",
      firstname: "John",
      lastname: "Doe",
      username: "johndoe",
      email: "john@example.com",
    };

    profileWrapper = await mountSuspended(SectionProfile, {
      global: {
        plugins: [pinia],
        stubs: {
          LoaderFade: true,
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the profile section when you visit the page", () => {
    expect(profileWrapper.exists()).toBe(true);
  });

  it("greets you with a title and a short description", () => {
    expect(profileWrapper.html()).toContain("ttl");
    expect(profileWrapper.html()).toContain("desc");
  });

  it("displays your profile details in the form fields", () => {
    const inputTexts = profileWrapper.findAllComponents(InputText);
    const inputEmail = profileWrapper.findComponent(InputEmail);

    expect(inputTexts).toHaveLength(3);
    expect(inputTexts[0].props("label")).toBe("name.first");
    expect(inputTexts[1].props("label")).toBe("name.last");
    expect(inputTexts[2].props("label")).toBe("name.user");
    expect(inputTexts[0].props("modelValue")).toBe("John");
    expect(inputTexts[1].props("modelValue")).toBe("Doe");
    expect(inputTexts[2].props("modelValue")).toBe("johndoe");

    expect(inputEmail.exists()).toBe(true);
    expect(inputEmail.props("label")).toBe("email");
    expect(inputEmail.props("modelValue")).toBe("john@example.com");
    expect(inputEmail.props("isDisabled")).toBe(true);
  });

  it("shows a save button so you can update your profile", () => {
    const button = profileWrapper.findComponent(BaseButtonIcon);
    expect(button.exists()).toBe(true);
    expect(button.props("text")).toBe("btn.save");
  });

  it("keeps the save button disabled until you make a change", () => {
    const button = profileWrapper.findComponent(BaseButtonIcon);
    expect(button.element.disabled).toBe(true);
  });

  it("lets you save your changes after you update your first name", async () => {
    const input = profileWrapper.findComponent(InputText);
    await input.setValue("Jane");
    await nextTick();

    const button = profileWrapper.findComponent(BaseButtonIcon);
    expect(button.element.disabled).toBe(false);
  });

  it("shows a happy message when your profile is updated", async () => {
    const button = profileWrapper.findComponent(BaseButtonIcon);

    userStore.updateInfo = vi.fn().mockResolvedValueOnce({
      status: "success",
      data: {
        firstname: "Jane",
        lastname: "Doe",
        username: "johndoe",
      },
    });

    await profileWrapper.findComponent(InputText).setValue("Jane");
    await nextTick();
    await button.trigger("click");
    await flushPromises();

    expect(userStore.updateInfo).toHaveBeenCalledWith({
      lastname: "Doe",
      firstname: "Jane",
      username: "johndoe",
      user_id: "id1",
    });

    toastAssertions.expectSuccessCalled("success");
    expect(mockUseToast.error).not.toHaveBeenCalled();
  });

  it("shows an error message if something goes wrong while saving", async () => {
    const button = profileWrapper.findComponent(BaseButtonIcon);

    userStore.updateInfo = vi.fn().mockResolvedValueOnce({
      status: "error",
      message: GenericErrors.SERVER_ERROR,
    });

    await profileWrapper.findComponent(InputText).setValue("Jane");
    await nextTick();
    await button.trigger("click");
    await flushPromises();

    expect(userStore.updateInfo).toHaveBeenCalledWith({
      lastname: "Doe",
      firstname: "Jane",
      username: "johndoe",
      user_id: "id1",
    });
    expect(mockUseToast.success).not.toHaveBeenCalled();
    toastAssertions.expectErrorCalled("generic_errors.SERVER_ERROR");
  });

  it("does nothing if you try to save without making changes", async () => {
    const button = profileWrapper.findComponent(BaseButtonIcon);
    userStore.updateInfo = vi.fn();

    expect(button.element.disabled).toBe(true);
    await button.trigger("click");

    expect(userStore.updateInfo).not.toHaveBeenCalled();
    toastAssertions.expectNoToastCalled();
  });

  it("still shows a happy message if the server says it worked but returns no data", async () => {
    const button = profileWrapper.findComponent(BaseButtonIcon);

    userStore.updateInfo = vi.fn().mockResolvedValueOnce({
      status: "success",
      data: null,
    });

    await profileWrapper.findComponent(InputText).setValue("Jane");
    await nextTick();
    await button.trigger("click");
    await flushPromises();

    expect(userStore.updateInfo).toHaveBeenCalled();
    toastAssertions.expectSuccessCalled("success");
    expect(mockUseToast.error).not.toHaveBeenCalled();
  });

  it("shows a generic error message if something unexpected happens while saving", async () => {
    const button = profileWrapper.findComponent(BaseButtonIcon);

    userStore.updateInfo = vi.fn().mockReturnValueOnce({
      status: "error",
      message: GenericErrors.SERVER_ERROR,
    });

    await profileWrapper.findComponent(InputText).setValue("Jane");
    await nextTick();
    await button.trigger("click");
    await flushPromises();

    expect(userStore.updateInfo).toHaveBeenCalled();
    toastAssertions.expectErrorCalled("generic_errors.SERVER_ERROR");
  });
});
