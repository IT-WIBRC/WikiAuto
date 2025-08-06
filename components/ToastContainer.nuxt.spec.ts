import { describe, it, expect, beforeEach, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { nextTick } from "vue";
import {
  ToastContainer,
  LazyIconToastSuccess,
  LazyIconToastError,
  LazyIconToastInfo,
  LazyIconToastWarning,
} from "#components";

import { getMockUseToastInstance } from "~/tests/mocks/mockUseToast";
import testUtils from "~/tests/utils/ui";

const { toastAssertions } = testUtils;
const mockUseToast = getMockUseToastInstance();
vi.mock("~/composables/useToast", () => {
  return {
    useToast: vi.fn(() => mockUseToast),
  };
});

describe("ToastContainer Component", () => {
  beforeEach(() => {
    mockUseToast.reset();
  });

  it("should not render if there are no toasts", async () => {
    const toastContainerWrapper = await mountSuspended(ToastContainer);
    await nextTick();

    expect(
      toastContainerWrapper
        .find("[data-testid='global-toast-manager-container']")
        .exists(),
    ).toBe(false);
    toastAssertions.expectNoToastCalled();
  });

  it("should render a single success toast correctly", async () => {
    mockUseToast.success("Hello Success!", {
      durationInSecond: 5,
      position: "bottom-right",
      customClass: "",
    });
    await nextTick();

    const toastContainerWrapper = await mountSuspended(ToastContainer);
    await nextTick();

    const globalContainerElement = toastContainerWrapper.find(
      "[data-testid='global-toast-manager-container']",
    );
    expect(globalContainerElement.exists()).toBe(true);
    expect(globalContainerElement.classes()).toContain("bottom-0");

    const toastElement = toastContainerWrapper.find(
      "[data-testid='toast-container']",
    );
    expect(toastElement.exists()).toBe(true);
    expect(toastElement.text()).toContain("Hello Success!");
    expect(toastElement.classes()).toContain("bg-gray-800");
    expect(toastElement.classes()).toContain("border-green-500");
    expect(toastElement.classes()).toContain("shadow-xl");
    expect(toastElement.classes()).toContain("shadow-green-500/20");

    expect(toastElement.findComponent(LazyIconToastSuccess).exists()).toBe(
      true,
    );

    const progressBarElement = toastElement.find(
      "[data-testid='toast-progress-bar']",
    );
    expect(progressBarElement.exists()).toBe(true);
    expect(progressBarElement.attributes().style).toContain(
      "background-color: #22c55e;",
    );
    expect(progressBarElement.attributes().style).toContain(
      "animation-duration: 5s;",
    );
  });

  it("should render a single error toast correctly", async () => {
    mockUseToast.error("Error message!", {
      durationInSecond: 7,
      position: "top-right",
      customClass: "error-toast",
    });
    await nextTick();

    const toastContainerWrapper = await mountSuspended(ToastContainer);
    await nextTick();

    const globalContainerElement = toastContainerWrapper.find(
      "[data-testid='global-toast-manager-container']",
    );
    expect(globalContainerElement.exists()).toBe(true);
    expect(globalContainerElement.classes()).toContain("top-0");
    expect(globalContainerElement.classes()).toContain("right-0");

    const toastElement = toastContainerWrapper.find(
      "[data-testid='toast-container']",
    );
    expect(toastElement.exists()).toBe(true);
    expect(toastElement.text()).toContain("Error message!");
    expect(toastElement.classes()).toContain("bg-gray-800");
    expect(toastElement.classes()).toContain("border-red-500");
    expect(toastElement.classes()).toContain("shadow-xl");
    expect(toastElement.classes()).toContain("shadow-red-500/20");
    expect(toastElement.classes()).toContain("error-toast");

    expect(toastElement.findComponent(LazyIconToastError).exists()).toBe(true);

    const progressBarElement = toastElement.find(
      "[data-testid='toast-progress-bar']",
    );
    expect(progressBarElement.exists()).toBe(true);
    expect(progressBarElement.attributes().style).toContain(
      "background-color: #ef4444;",
    );
    expect(progressBarElement.attributes().style).toContain(
      "animation-duration: 7s;",
    );
  });

  it("should render a single info toast correctly", async () => {
    mockUseToast.info("Info message!", {
      durationInSecond: 3,
      position: "bottom-left",
      customClass: "",
    });
    await nextTick();

    const toastContainerWrapper = await mountSuspended(ToastContainer);
    await nextTick();

    const globalContainerElement = toastContainerWrapper.find(
      "[data-testid='global-toast-manager-container']",
    );
    expect(globalContainerElement.exists()).toBe(true);
    expect(globalContainerElement.classes()).toContain("bottom-0");
    expect(globalContainerElement.classes()).toContain("left-0");

    const toastElement = toastContainerWrapper.find(
      "[data-testid='toast-container']",
    );
    expect(toastElement.exists()).toBe(true);
    expect(toastElement.text()).toContain("Info message!");
    expect(toastElement.classes()).toContain("bg-gray-800");
    expect(toastElement.classes()).toContain("border-blue-500");
    expect(toastElement.classes()).toContain("shadow-xl");
    expect(toastElement.classes()).toContain("shadow-blue-500/20");

    expect(toastElement.findComponent(LazyIconToastInfo).exists()).toBe(true);

    const progressBarElement = toastElement.find(
      "[data-testid='toast-progress-bar']",
    );
    expect(progressBarElement.exists()).toBe(true);
    expect(progressBarElement.attributes().style).toContain(
      "background-color: #3b82f6;",
    );
    expect(progressBarElement.attributes().style).toContain(
      "animation-duration: 3s;",
    );
  });

  it("should render a single warning toast correctly", async () => {
    mockUseToast.warning("Warning message!", {
      durationInSecond: 6,
      position: "top-left",
      customClass: "warning-toast",
    });
    await nextTick();

    const toastContainerWrapper = await mountSuspended(ToastContainer);
    await nextTick();

    const globalContainerElement = toastContainerWrapper.find(
      "[data-testid='global-toast-manager-container']",
    );
    expect(globalContainerElement.exists()).toBe(true);
    expect(globalContainerElement.classes()).toContain("top-0");
    expect(globalContainerElement.classes()).toContain("left-0");

    const toastElement = toastContainerWrapper.find(
      "[data-testid='toast-container']",
    );
    expect(toastElement.exists()).toBe(true);
    expect(toastElement.text()).toContain("Warning message!");
    expect(toastElement.classes()).toContain("bg-gray-800");
    expect(toastElement.classes()).toContain("border-yellow-500");
    expect(toastElement.classes()).toContain("shadow-xl");
    expect(toastElement.classes()).toContain("shadow-yellow-500/20");
    expect(toastElement.classes()).toContain("warning-toast");

    expect(toastElement.findComponent(LazyIconToastWarning).exists()).toBe(
      true,
    );

    const progressBarElement = toastElement.find(
      "[data-testid='toast-progress-bar']",
    );
    expect(progressBarElement.exists()).toBe(true);
    expect(progressBarElement.attributes().style).toContain(
      "background-color: #f59e0b;",
    );
    expect(progressBarElement.attributes().style).toContain(
      "animation-duration: 6s;",
    );
  });

  it("should render multiple toasts and stack them based on position", async () => {
    mockUseToast.info("First toast", {
      durationInSecond: 5,
      position: "bottom-right",
    });
    mockUseToast.warning("Second toast", {
      durationInSecond: 5,
      position: "bottom-right",
    });
    mockUseToast.error("Third toast", {
      durationInSecond: 5,
      position: "bottom-right",
    });
    await nextTick();

    const toastContainerWrapper = await mountSuspended(ToastContainer);
    await nextTick();

    const globalContainerElement = toastContainerWrapper.find(
      "[data-testid='global-toast-manager-container']",
    );
    expect(globalContainerElement.classes()).toContain("flex-col-reverse");

    const toastElements = toastContainerWrapper.findAll(
      "[data-testid='toast-container']",
    );
    expect(toastElements.length).toBe(3);

    expect(toastElements[0].text()).toContain("First toast");
    expect(toastElements[1].text()).toContain("Second toast");
    expect(toastElements[2].text()).toContain("Third toast");

    expect(toastElements[0].findComponent(LazyIconToastInfo).exists()).toBe(
      true,
    );
    expect(toastElements[1].findComponent(LazyIconToastWarning).exists()).toBe(
      true,
    );
    expect(toastElements[2].findComponent(LazyIconToastError).exists()).toBe(
      true,
    );
  });

  it("should call removeToastById when close button is clicked", async () => {
    mockUseToast.info("Close me!", {
      durationInSecond: 5,
      position: "bottom-right",
    });
    await nextTick();

    const toastContainerWrapper = await mountSuspended(ToastContainer);
    await nextTick();

    const closeButtonElement = toastContainerWrapper.find(
      "[data-testid='toast-close-button']",
    );
    expect(closeButtonElement.exists()).toBe(true);

    const toastIdToClose = mockUseToast.toasts[0].id;
    await closeButtonElement.trigger("click");

    toastAssertions.expectRemoveToastByIdCalled(toastIdToClose);

    mockUseToast.dismissAll();
    await nextTick();
    expect(
      toastContainerWrapper.find("[data-testid='toast-container']").exists(),
    ).toBe(false);
  });

  it("should apply custom classes to the toast container", async () => {
    mockUseToast.info("Custom class", {
      durationInSecond: 5,
      position: "bottom-right",
      customClass: "my-special-toast",
    });
    await nextTick();

    const toastContainerWrapper = await mountSuspended(ToastContainer);
    await nextTick();

    const toastElement = toastContainerWrapper.find(
      "[data-testid='toast-container']",
    );
    expect(toastElement.exists()).toBe(true);
    expect(toastElement.classes()).toContain("my-special-toast");
  });

  it("should apply multiple custom classes to the toast container", async () => {
    mockUseToast.success("Custom classes array", {
      durationInSecond: 5,
      position: "bottom-right",
      customClass: ["class-a", "class-b"],
    });
    await nextTick();

    const toastContainerWrapper = await mountSuspended(ToastContainer);
    await nextTick();

    const toastElement = toastContainerWrapper.find(
      "[data-testid='toast-container']",
    );
    expect(toastElement.exists()).toBe(true);
    expect(toastElement.classes()).toContain("class-a");
    expect(toastElement.classes()).toContain("class-b");
  });
});
