import {
  afterAll,
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import {
  Badge,
  BaseButtonIcon,
  InputText,
  LazyIconTheme,
  LazyLoaderFade,
  ModalLayout,
  BadgeEdit,
} from "#components";
import { useBadgeStore } from "~/stores/badge.store";
import testUtils from "~/tests/utils/ui";
import { getMockUseToastInstance } from "~/tests/mocks/mockUseToast";

const { getPiniaInstance, toastAssertions, getMockBadges, flushPromises } =
  testUtils;

const mockUseToast = getMockUseToastInstance();
vi.mock("~/composables/useToast", () => ({
  useToast: vi.fn(() => mockUseToast),
}));

describe("BadgeEdit", () => {
  mockUseToast.reset();
  const pinia = getPiniaInstance({ stubActions: true });

  const badgeStore = useBadgeStore(pinia);
  badgeStore.badgeList = getMockBadges();

  let badgeEdit: VueWrapper;
  beforeEach(async () => {
    vi.useFakeTimers();
    badgeEdit = await mountSuspended(BadgeEdit, {
      props: {
        id: "1",
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
    vi.clearAllTimers();
    vi.clearAllMocks();
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
    expect(preview.props().text).toBe("Radio");
  });

  it("should render the field to fill the name with the default value present on the props `name`", () => {
    const name = badgeEdit.findComponent(InputText);
    expect(name.exists()).toBe(true);
    expect(name.props()).toEqual({
      modelValue: "Radio",
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
    expect(createButton.element.disabled).toBe(true);
    expect(createButton.props().text).toBe("edit_btn");
    expect(createButton.findComponent(LazyIconTheme).exists()).toBe(true);
  });

  it("should display an error when the name is less than 2 character", async () => {
    let name = badgeEdit.findComponent(InputText);
    expect(name.exists()).toBe(true);
    await name.setValue("n");
    await badgeEdit.findComponent(BaseButtonIcon).trigger("click");

    await flushPromises(badgeEdit);

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

    await flushPromises(badgeEdit);

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

    await badgeEdit.findComponent(BaseButtonIcon).trigger("click");

    expect(badgeEdit.findComponent(LazyLoaderFade).exists()).toBe(true);

    await flushPromises(badgeEdit);

    toastAssertions.expectSuccessCalled("success");

    expect(badgeEdit.emitted()).toHaveProperty("edited");
    expect(badgeEdit.emitted()).toHaveProperty("closed");

    expect(badgeStore.edit).toHaveBeenCalledWith({
      id: "1",
      name: "js",
      description: "",
    });
  });

  it("should edit the badge when the name is well edited as well as the description", async () => {
    await badgeEdit.findComponent(InputText).setValue("js");
    await badgeEdit.findAllComponents(InputText)[1].setValue("Everything");

    const badgeStore = useBadgeStore(pinia);
    badgeStore.edit = vi.fn().mockReturnValueOnce({
      status: "success",
    });
    await badgeEdit.findComponent(BaseButtonIcon).trigger("click");

    await flushPromises(badgeEdit);

    expect(badgeStore.edit).toHaveBeenCalledWith({
      id: "1",
      name: "js",
      description: "Everything",
    });
    expect(mockUseToast.success).toHaveBeenCalledTimes(2);
    expect(mockUseToast.success).toHaveBeenCalledWith("success");

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
    await badgeEdit.findComponent(BaseButtonIcon).trigger("click");

    await flushPromises(badgeEdit);

    toastAssertions.expectErrorCalled("failed");
    expect(badgeStore.edit).toHaveBeenCalledWith({
      id: "1",
      name: "js",
      description: "Everything",
    });
  });
});
