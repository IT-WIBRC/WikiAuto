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
  BadgeCreate,
} from "#components";
import { createTestingPinia } from "@pinia/testing";

const mockToast = (method: "success" | "error") =>
  vi.spyOn(useToast.prototype, method);

describe("BadgeCreate", () => {
  mockNuxtImport("useI18n", () => {
    return () => ({
      t: vi.fn((msg: string) => msg),
    });
  });

  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
  });
  let badgeCreate: VueWrapper;
  beforeEach(async () => {
    vi.useFakeTimers();
    badgeCreate = await mountSuspended(BadgeCreate, {
      props: {
        name: "name",
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
    expect(badgeCreate.exists()).toBe(true);
  });

  it("should render modal layout", () => {
    expect(badgeCreate.findComponent(ModalLayout).exists()).toBe(true);
  });

  it("should render the awaited preview", () => {
    const preview = badgeCreate.findComponent(Badge);
    expect(preview.exists()).toBe(true);
    expect(preview.props().text).toBe("name");
  });

  it("should render the field to fill the name with the default value present on the props `name`", () => {
    const name = badgeCreate.findComponent(InputText);
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
    const description = badgeCreate.findAllComponents(InputText)[1];
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
    const createButton = badgeCreate.findComponent(BaseButtonIcon);
    expect(createButton.exists()).toBe(true);
    expect(createButton.props().text).toBe("save_btn");
    expect(createButton.findComponent(LazyIconTheme).exists()).toBe(true);
  });

  it("should display an error when the name is less than 2 character", async () => {
    let name = badgeCreate.findComponent(InputText);
    expect(name.exists()).toBe(true);
    await name.setValue("n");
    await badgeCreate.findComponent(BaseButtonIcon).trigger("click");

    vi.advanceTimersByTime(50);
    await flushPromises();
    await badgeCreate.vm.$nextTick();

    name = badgeCreate.findComponent(InputText);
    expect(name.exists()).toBe(true);
    expect(name.props().errorMessage).toBe("name.error.moreThan");
  });

  it("should display an error when the description is more than 60 characters", async () => {
    await badgeCreate.findComponent(InputText).setValue("DDD/TDD");
    let description = badgeCreate.findAllComponents(InputText)[1];
    expect(description.exists()).toBe(true);
    await description.setValue(
      "Domain Driven Development and Test Driven Development are the core of software development",
    );
    await badgeCreate.findComponent(BaseButtonIcon).trigger("click");

    vi.advanceTimersByTime(50);
    await flushPromises();
    await badgeCreate.vm.$nextTick();

    description = badgeCreate.findAllComponents(InputText)[1];
    expect(description.exists()).toBe(true);
    expect(description.props().errorMessage).toBe("description.lessThan");
  });

  it("should create the badge when the name is well filled", async () => {
    await badgeCreate.findComponent(InputText).setValue("js");

    const badgeStore = useBadgeStore(pinia);
    badgeStore.create = vi.fn().mockReturnValueOnce({
      status: "success",
    });
    const toastSuccess = mockToast("success");
    await badgeCreate.findComponent(BaseButtonIcon).trigger("click");

    expect(badgeCreate.findComponent(LazyLoaderFade).exists()).toBe(true);

    vi.advanceTimersByTime(50);
    await flushPromises();
    await badgeCreate.vm.$nextTick();

    expect(toastSuccess).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledWith("success");
    expect(badgeCreate.emitted()).toHaveProperty("created");
    expect(badgeCreate.emitted()).toHaveProperty("closed");

    expect(badgeStore.create).toHaveBeenCalledWith("js", "");
  });

  it("should create the badge when the name is well filled as well as the description", async () => {
    await badgeCreate.findComponent(InputText).setValue("js");
    await badgeCreate.findAllComponents(InputText)[1].setValue("Everything");

    const badgeStore = useBadgeStore(pinia);
    const toastSuccess = mockToast("success");
    badgeStore.create = vi.fn().mockReturnValueOnce({
      status: "success",
    });
    await badgeCreate.findComponent(BaseButtonIcon).trigger("click");

    vi.advanceTimersByTime(50);
    await flushPromises();
    await badgeCreate.vm.$nextTick();

    expect(badgeStore.create).toHaveBeenCalledWith("js", "Everything");
    expect(toastSuccess).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledWith("success");
    expect(badgeCreate.emitted()).toHaveProperty("created");
    expect(badgeCreate.emitted()).toHaveProperty("closed");
  });

  it("should toast an error when the creation failed", async () => {
    await badgeCreate.findComponent(InputText).setValue("js");
    await badgeCreate.findAllComponents(InputText)[1].setValue("Everything");

    const badgeStore = useBadgeStore(pinia);
    badgeStore.create = vi.fn().mockReturnValueOnce({
      status: "error",
    });
    const toastError = mockToast("error");
    await badgeCreate.findComponent(BaseButtonIcon).trigger("click");

    vi.advanceTimersByTime(50);
    await flushPromises();
    await badgeCreate.vm.$nextTick();

    expect(toastError).toHaveBeenCalledTimes(1);
    expect(toastError).toHaveBeenCalledWith("failed");
    expect(badgeStore.create).toHaveBeenCalledWith("js", "Everything");
  });
});
