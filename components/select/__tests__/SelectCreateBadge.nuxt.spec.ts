import { afterAll, beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises, type VueWrapper } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import {
  Badge,
  BaseButtonIcon,
  InputText,
  LazyIconTheme, LazyLoaderFade,
  ModalLayout,
  SelectCreateBadge,
} from "#components";
import { createTestingPinia } from "@pinia/testing";

const mockToast = (method: "success" | "error") =>
  vi.spyOn(useToast.prototype, method);

describe("SelectCreateBadge", () => {
  mockNuxtImport("useI18n", () => {
    return () => ({
      t: vi.fn((msg: string) => msg),
    });
  });

  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
  });
  let selectCreateBadge: VueWrapper;
  beforeEach(async () => {
    vi.useFakeTimers();
    selectCreateBadge = await mountSuspended(SelectCreateBadge, {
      props: {
        name: "name",
      },
      global: {
        plugins: [pinia],
      }
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it("should render correctly", () => {
    expect(selectCreateBadge.exists()).toBe(true);
  });

  it("should render modal layout", () => {
    expect(selectCreateBadge.findComponent(ModalLayout).exists()).toBe(true);
  });

  it("should render the awaited preview", () => {
    const preview = selectCreateBadge.findComponent(Badge);
    expect(preview.exists()).toBe(true);
    expect(preview.props().text).toBe("name");
  });

  it("should render the field to fill the name with the default value present on the props `name`", () => {
    const name = selectCreateBadge.findComponent(InputText);
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
    const description = selectCreateBadge.findAllComponents(InputText)[1];
    expect(description.exists()).toBe(true);
    expect(description.props()).toEqual({
      modelValue: "",
      placeholder: "description.ph",
      label: "description.lbl",
      isRequired: false,
      limitCharacter: 60,
      errorMessage: "",
      hasError: false,
    });
  });

  it("should display the button to create", () => {
    const createButton = selectCreateBadge.findComponent(BaseButtonIcon);
    expect(createButton.exists()).toBe(true);
    expect(createButton.props().text).toBe("save_btn");
    expect(createButton.findComponent(LazyIconTheme).exists()).toBe(true);
  });

  it("should display an error when the name is less than 2 character", async () => {
    let name = selectCreateBadge.findComponent(InputText);
    expect(name.exists()).toBe(true);
    await name.setValue("n");
    await selectCreateBadge.findComponent(BaseButtonIcon).trigger("click");

    vi.advanceTimersByTime(50);
    await flushPromises();
    await selectCreateBadge.vm.$nextTick();

    name = selectCreateBadge.findComponent(InputText);
    expect(name.exists()).toBe(true);
    expect(name.props().errorMessage).toBe("name.error.moreThan");
  });

  it("should display an error when the description is more than 60 characters", async () => {
    await selectCreateBadge.findComponent(InputText).setValue("DDD/TDD");
    let description = selectCreateBadge.findAllComponents(InputText)[1];
    expect(description.exists()).toBe(true);
    await description.setValue("Domain Driven Development and Test Driven Development are the core of software development");
    await selectCreateBadge.findComponent(BaseButtonIcon).trigger("click");

    vi.advanceTimersByTime(50);
    await flushPromises();
    await selectCreateBadge.vm.$nextTick();

    description = selectCreateBadge.findAllComponents(InputText)[1];
    expect(description.exists()).toBe(true);
    expect(description.props().errorMessage).toBe("description.lessThan");
  });

  it("should create the badge when the name is well filled", async () => {
    await selectCreateBadge.findComponent(InputText).setValue("js");

    const badgeStore = useBadgeStore(pinia);
    badgeStore.create = vi.fn().mockReturnValueOnce({
      status: "success",
    });
    const toastSuccess = mockToast("success");
    await selectCreateBadge.findComponent(BaseButtonIcon).trigger("click");

    expect(selectCreateBadge.findComponent(LazyLoaderFade).exists()).toBe(true);

    vi.advanceTimersByTime(50);
    await flushPromises();
    await selectCreateBadge.vm.$nextTick();

    expect(toastSuccess).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledWith("success");
    expect(selectCreateBadge.emitted()).toHaveProperty("created");
    expect(selectCreateBadge.emitted()).toHaveProperty("closed");

    expect(badgeStore.create).toHaveBeenCalledWith("js", "");
  });

  it("should create the badge when the name is well filled as well as the description", async () => {
    await selectCreateBadge.findComponent(InputText).setValue("js");
    await selectCreateBadge
      .findAllComponents(InputText)[1]
      .setValue("Everything");

    const badgeStore = useBadgeStore(pinia);
    const toastSuccess = mockToast("success");
    badgeStore.create = vi.fn().mockReturnValueOnce({
      status: "success",
    });
    await selectCreateBadge
      .findComponent(BaseButtonIcon)
      .trigger("click");

    vi.advanceTimersByTime(50);
    await flushPromises();
    await selectCreateBadge.vm.$nextTick();

    expect(badgeStore.create).toHaveBeenCalledWith("js", "Everything");
    expect(toastSuccess).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledWith("success");
    expect(selectCreateBadge.emitted()).toHaveProperty("created");
    expect(selectCreateBadge.emitted()).toHaveProperty("closed");

  });

  it("should toast an error when the creation failed", async () => {
    await selectCreateBadge.findComponent(InputText).setValue("js");
    await selectCreateBadge
      .findAllComponents(InputText)[1]
      .setValue("Everything");

    const badgeStore = useBadgeStore(pinia);
    badgeStore.create = vi.fn().mockReturnValueOnce({
      status: "error",
    });
    const toastError = mockToast("error");
    await selectCreateBadge.findComponent(BaseButtonIcon).trigger("click");

    vi.advanceTimersByTime(50);
    await flushPromises();
    await selectCreateBadge.vm.$nextTick();

    expect(toastError).toHaveBeenCalledTimes(1);
    expect(toastError).toHaveBeenCalledWith("failed");
    expect(badgeStore.create).toHaveBeenCalledWith("js", "Everything");
  });
});
