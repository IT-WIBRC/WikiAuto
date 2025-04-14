import {
  afterAll,
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { flushPromises, type VueWrapper } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import {
  Badge,
  BaseButtonIcon,
  InputText,
  LazyIconTheme,
  LazyLoaderFade,
  ModalLayout,
  BadgeEdit,
} from "#components";
import { createTestingPinia } from "@pinia/testing";
import { useBadgeStore } from "~/stores/badge.store";

const mockToast = (method: "success" | "error") =>
  vi.spyOn(useToast.prototype, method);

describe("BadgeEdit", () => {
  mockNuxtImport("useI18n", () => {
    return () => ({
      t: vi.fn((msg: string) => msg),
    });
  });

  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
  });
  const badgeStore = useBadgeStore(pinia);
  badgeStore.badgeList = [
    {
      badge_id: "123548498",
      name: "name",
      description: "description",
    },
  ];

  let badgeEdit: VueWrapper;
  beforeEach(async () => {
    vi.useFakeTimers();
    badgeEdit = await mountSuspended(BadgeEdit, {
      props: {
        id: "123548498",
      },
      global: {
        plugins: [pinia],
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it("should render correctly", () => {
    expect(badgeEdit.exists()).toBe(true);
  });

  it("should render modal layout", () => {
    expect(badgeEdit.findComponent(ModalLayout).exists()).toBe(true);
  });

  it("should render the awaited preview", () => {
    const preview = badgeEdit.findComponent(Badge);
    expect(preview.exists()).toBe(true);
    expect(preview.props().text).toBe("name");
  });

  it("should render the field to fill the name with the default value present on the props `name`", () => {
    const name = badgeEdit.findComponent(InputText);
    expect(name.exists()).toBe(true);
    expect(name.props()).toEqual({
      modelValue: "name",
      placeholder: "name.ph",
      label: "name.lbl",
      limitCharacter: 30,
      isRequired: true,
      hasError: false,
    });
  });

  it("should render the field to fill the description", () => {
    const description = badgeEdit.findAllComponents(InputText)[1];
    expect(description.exists()).toBe(true);
    expect(description.props()).toEqual({
      modelValue: "description",
      placeholder: "description.ph",
      label: "description.lbl",
      isRequired: false,
      limitCharacter: 60,
      errorMessage: "",
      hasError: false,
    });
  });

  it("should display the button to edit", () => {
    const createButton = badgeEdit.findComponent(BaseButtonIcon);
    expect(createButton.exists()).toBe(true);
    expect(createButton.props().text).toBe("edit_btn");
    expect(createButton.findComponent(LazyIconTheme).exists()).toBe(true);
  });

  it("should display an error when the name is less than 2 character", async () => {
    let name = badgeEdit.findComponent(InputText);
    expect(name.exists()).toBe(true);
    await name.setValue("n");
    await badgeEdit.findComponent(BaseButtonIcon).trigger("click");

    vi.advanceTimersByTime(50);
    await flushPromises();
    await badgeEdit.vm.$nextTick();

    name = badgeEdit.findComponent(InputText);
    expect(name.exists()).toBe(true);
    expect(name.props().errorMessage).toBe("name.error.moreThan");
  });

  it("should display an error when the description is more than 60 characters", async () => {
    await badgeEdit.findComponent(InputText).setValue("DDD/TDD");
    let description = badgeEdit.findAllComponents(InputText)[1];
    expect(description.exists()).toBe(true);
    await description.setValue(
      "Domain Driven Development and Test Driven Development are the core of software development",
    );
    await badgeEdit.findComponent(BaseButtonIcon).trigger("click");

    vi.advanceTimersByTime(50);
    await flushPromises();
    await badgeEdit.vm.$nextTick();

    description = badgeEdit.findAllComponents(InputText)[1];
    expect(description.exists()).toBe(true);
    expect(description.props().errorMessage).toBe("description.lessThan");
  });

  it("should edit the badge when the name is well filled but the description erased", async () => {
    await badgeEdit.findComponent(InputText).setValue("js");
    await badgeEdit.findAllComponents(InputText)[1].setValue("");

    const badgeStore = useBadgeStore(pinia);
    badgeStore.edit = vi.fn().mockReturnValueOnce({
      status: "success",
    });
    const toastSuccess = mockToast("success");
    await badgeEdit.findComponent(BaseButtonIcon).trigger("click");

    expect(badgeEdit.findComponent(LazyLoaderFade).exists()).toBe(true);

    vi.advanceTimersByTime(50);
    await flushPromises();
    await badgeEdit.vm.$nextTick();

    expect(toastSuccess).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledWith("success");
    expect(badgeEdit.emitted()).toHaveProperty("edited");
    expect(badgeEdit.emitted()).toHaveProperty("closed");

    expect(badgeStore.edit).toHaveBeenCalledWith({
      id: "123548498",
      name: "js",
      description: "",
    });
  });

  it("should edit the badge when the name is well edited as well as the description", async () => {
    await badgeEdit.findComponent(InputText).setValue("js");
    await badgeEdit.findAllComponents(InputText)[1].setValue("Everything");

    const badgeStore = useBadgeStore(pinia);
    const toastSuccess = mockToast("success");
    badgeStore.edit = vi.fn().mockReturnValueOnce({
      status: "success",
    });
    await badgeEdit.findComponent(BaseButtonIcon).trigger("click");

    vi.advanceTimersByTime(50);
    await flushPromises();
    await badgeEdit.vm.$nextTick();

    expect(badgeStore.edit).toHaveBeenCalledWith({
      id: "123548498",
      name: "js",
      description: "Everything",
    });
    expect(toastSuccess).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledWith("success");
    expect(badgeEdit.emitted()).toHaveProperty("edited");
    expect(badgeEdit.emitted()).toHaveProperty("closed");
  });

  it("should toast an error when the edition failed", async () => {
    await badgeEdit.findComponent(InputText).setValue("js");
    await badgeEdit.findAllComponents(InputText)[1].setValue("Everything");

    const badgeStore = useBadgeStore(pinia);
    badgeStore.edit = vi.fn().mockReturnValueOnce({
      status: "error",
    });
    const toastError = mockToast("error");
    await badgeEdit.findComponent(BaseButtonIcon).trigger("click");

    vi.advanceTimersByTime(50);
    await flushPromises();
    await badgeEdit.vm.$nextTick();

    expect(toastError).toHaveBeenCalledTimes(1);
    expect(toastError).toHaveBeenCalledWith("failed");
    expect(badgeStore.edit).toHaveBeenCalledWith({
      id: "123548498",
      name: "js",
      description: "Everything",
    });
  });
});
