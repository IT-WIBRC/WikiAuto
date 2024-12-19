import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { flushPromises, type VueWrapper } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import {
  Badge,
  BaseButtonIcon,
  InputText,
  LazyIconTheme,
  ModalLayout,
  SelectCreateBadge,
} from "#components";
import { createTestingPinia } from "@pinia/testing";

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
  beforeAll(async () => {
    selectCreateBadge = await mountSuspended(SelectCreateBadge, {
      props: {
        name: "name",
      },
    });
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

  it("should render teh field to fill the name with the default value present on the props `name`", () => {
    const name = selectCreateBadge.findComponent(InputText);
    expect(name.exists()).toBe(true);
    expect(name.props()).toEqual({
      modelValue: "name",
      placeholder: "name.ph",
      label: "name.lbl",
      errorMessage: "",
      isRequired: true,
      hasError: false,
    });
  });

  it("should render teh field to fill the description", () => {
    const description = selectCreateBadge.findAllComponents(InputText)[1];
    expect(description.exists()).toBe(true);
    expect(description.props()).toEqual({
      modelValue: "",
      placeholder: "description.ph",
      label: "description.lbl",
      isRequired: false,
      hasError: false,
    });
  });

  it("should display the button to create", () => {
    const createButton = selectCreateBadge.findComponent(BaseButtonIcon);
    expect(createButton.exists()).toBe(true);
    expect(createButton.props().text).toBe("save_btn");
    expect(createButton.findComponent(LazyIconTheme).exists()).toBe(true);
  });

  it("should display an error when the name is empty", async () => {
    let name = selectCreateBadge.findComponent(InputText);
    expect(name.exists()).toBe(true);
    expect(name.props().errorMessage).toBe("");
    selectCreateBadge = await mountSuspended(SelectCreateBadge, {
      props: {
        name: "",
      },
    });
    await selectCreateBadge.findComponent(BaseButtonIcon).trigger("click");

    name = selectCreateBadge.findComponent(InputText);
    expect(name.exists()).toBe(true);
    expect(name.props().errorMessage).toBe("name.error.required");
  });

  it("should display an error when the name is less than 2 character", async () => {
    selectCreateBadge = await mountSuspended(SelectCreateBadge, {
      props: {
        name: "",
      },
    });
    let name = selectCreateBadge.findComponent(InputText);
    expect(name.exists()).toBe(true);
    await name.setValue("n");
    await selectCreateBadge.findComponent(BaseButtonIcon).trigger("click");

    name = selectCreateBadge.findComponent(InputText);
    expect(name.exists()).toBe(true);
    expect(name.props().errorMessage).toBe("name.error.moreThan2");
  });

  it("should create the badge when the name is well filled", async () => {
    selectCreateBadge = await mountSuspended(SelectCreateBadge, {
      props: {
        name: "",
      },
      global: {
        plugins: [pinia],
      },
    });
    await selectCreateBadge.findComponent(InputText).setValue("js");

    const badgeStore = useBadgeStore(pinia);
    badgeStore.create = vi.fn().mockReturnValueOnce({
      status: "success",
    });
    useToast.success = vi.fn();
    await selectCreateBadge.findComponent(BaseButtonIcon).trigger("click");
    await flushPromises();

    expect(selectCreateBadge.emitted()).toHaveProperty("created");
    expect(useToast.success).toHaveBeenCalledTimes(1);
    expect(useToast.success).toHaveBeenCalledWith("success");
    expect(selectCreateBadge.emitted()).toHaveProperty("closed");

    expect(badgeStore.create).toHaveBeenCalledWith("js", "");
  });

  it("should create the badge when the name is well filled as well as the description", async () => {
    selectCreateBadge = await mountSuspended(SelectCreateBadge, {
      props: {
        name: "",
      },
      global: {
        plugins: [pinia],
      },
    });
    await selectCreateBadge.findComponent(InputText).setValue("js");
    await selectCreateBadge
      .findAllComponents(InputText)[1]
      .setValue("Everything");

    const badgeStore = useBadgeStore(pinia);
    badgeStore.create = vi.fn().mockReturnValueOnce({
      status: "success",
    });
    useToast.success = vi.fn();
    await selectCreateBadge.findComponent(BaseButtonIcon).trigger("click");
    await flushPromises();

    expect(selectCreateBadge.emitted()).toHaveProperty("created");
    expect(useToast.success).toHaveBeenCalledTimes(1);
    expect(useToast.success).toHaveBeenCalledWith("success");
    expect(selectCreateBadge.emitted()).toHaveProperty("closed");

    expect(badgeStore.create).toHaveBeenCalledWith("js", "Everything");
  });

  it("should toast an error when the creation failed", async () => {
    selectCreateBadge = await mountSuspended(SelectCreateBadge, {
      props: {
        name: "",
      },
      global: {
        plugins: [pinia],
      },
    });
    await selectCreateBadge.findComponent(InputText).setValue("js");
    await selectCreateBadge
      .findAllComponents(InputText)[1]
      .setValue("Everything");

    const badgeStore = useBadgeStore(pinia);
    badgeStore.create = vi.fn().mockReturnValueOnce({
      status: "error",
    });
    useToast.error = vi.fn();
    await selectCreateBadge.findComponent(BaseButtonIcon).trigger("click");
    await flushPromises();

    expect(useToast.error).toHaveBeenCalledTimes(1);
    expect(useToast.error).toHaveBeenCalledWith("failed");

    expect(badgeStore.create).toHaveBeenCalledWith("js", "Everything");
  });
});
