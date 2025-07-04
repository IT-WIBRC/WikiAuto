import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  beforeAll,
  afterAll,
} from "vitest";
import { nextTick } from "vue";
import { useToast } from "../useToast";

describe("useToast Composable", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  beforeEach(() => {
    const { dismissAll } = useToast();
    dismissAll();
    vi.clearAllTimers();
    vi.runOnlyPendingTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("should initialize with an empty toast list", () => {
    const { toasts } = useToast();
    expect(toasts.length).toBe(0);
  });

  it("should add a success toast with default duration and position", async () => {
    const { success, toasts } = useToast();
    const message = "Operation successful!";
    success(message);

    await nextTick();

    expect(toasts.length).toBe(1);
    expect(toasts[0]).toMatchObject({
      message,
      type: "success",
      durationInSecond: 5,
      position: "bottom-right",
    });
    expect(toasts[0].id).toBeTypeOf("string");
    expect(toasts[0].timeoutId).toBeDefined();
  });

  it("should add an error toast with custom duration and position", async () => {
    const { error, toasts } = useToast();
    const message = "Something went wrong!";
    error(message, {
      durationInSecond: 10,
      position: "top-left",
    });

    await nextTick();

    expect(toasts.length).toBe(1);
    expect(toasts[0]).toMatchObject({
      message,
      type: "error",
      durationInSecond: 10,
      position: "top-left",
    });
  });

  it("should add an info toast", async () => {
    const { info, toasts } = useToast();
    const message = "Information message!";
    info(message);

    await nextTick();

    expect(toasts.length).toBe(1);
    expect(toasts[0]).toMatchObject({
      message,
      type: "info",
      durationInSecond: 5,
      position: "bottom-right",
    });
  });

  it("should add a warning toast", async () => {
    const { warning, toasts } = useToast();
    const message = "Warning message!";
    warning(message);

    await nextTick();

    expect(toasts.length).toBe(1);
    expect(toasts[0]).toMatchObject({
      message,
      type: "warning",
      durationInSecond: 5,
      position: "bottom-right",
    });
  });

  it("should add multiple toasts and manage their state independently", async () => {
    const { success, info, toasts } = useToast();

    success("First toast");
    await nextTick();
    expect(toasts.length).toBe(1);

    info("Second toast");
    await nextTick();
    expect(toasts.length).toBe(2);

    expect(toasts[0].message).toBe("First toast");
    expect(toasts[1].message).toBe("Second toast");
  });

  it("should automatically dismiss a toast after its duration", async () => {
    const { success, toasts } = useToast();
    success("Auto-dismiss test", { durationInSecond: 2 });

    await nextTick();
    expect(toasts.length).toBe(1);

    vi.advanceTimersByTime(1999);
    await nextTick();
    expect(toasts.length).toBe(1);

    vi.advanceTimersByTime(1);
    await nextTick();
    expect(toasts.length).toBe(0);
  });

  it("should dismiss a toast by ID", async () => {
    const { success, info, toasts, removeToastById } = useToast();

    success("Toast to remove");
    info("Another toast");
    await nextTick();
    expect(toasts.length).toBe(2);

    const toastToRemoveId = toasts[0].id;
    removeToastById(toastToRemoveId);
    await nextTick();

    expect(toasts.length).toBe(1);
    expect(toasts[0].message).toBe("Another toast");
    expect(toasts.find((t) => t.id === toastToRemoveId)).toBeUndefined();
  });

  it("should not dismiss a toast if ID does not match", async () => {
    const { success, toasts, removeToastById } = useToast();
    success("Toast 1");
    await nextTick();
    expect(toasts.length).toBe(1);

    removeToastById("non-existent-id");
    await nextTick();
    expect(toasts.length).toBe(1);
  });

  it("should dismiss all toasts", async () => {
    const { success, error, info, dismissAll, toasts } = useToast();

    success("Toast 1");
    error("Toast 2");
    info("Toast 3");
    await nextTick();
    expect(toasts.length).toBe(3);

    dismissAll();
    await nextTick();

    expect(toasts.length).toBe(0);
  });

  it("should handle custom classes correctly", async () => {
    const { success, toasts } = useToast();
    success("Custom class test", { customClass: "my-custom-class" });

    await nextTick();

    expect(toasts.length).toBe(1);
    expect(toasts[0].customClass).toBe("my-custom-class");
  });

  it("should handle array of custom classes correctly", async () => {
    const { success, toasts } = useToast();
    success("Custom class array test", { customClass: ["class-a", "class-b"] });

    await nextTick();

    expect(toasts.length).toBe(1);
    expect(toasts[0].customClass).toEqual(["class-a", "class-b"]);
  });
});
