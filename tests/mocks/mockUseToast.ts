import { vi } from "vitest";
import { reactive } from "vue";
import type { InternalToastItem, ToastOptionParam } from "~/types/toast";

const _mockToasts = reactive<InternalToastItem[]>([]);

export const mockSuccess = vi.fn(
  (message: string, options?: ToastOptionParam) => {
    const newToast: InternalToastItem = {
      id: `mock-toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      message,
      type: "success",
      durationInSecond: options?.durationInSecond || 5,
      position: options?.position || "bottom-right",
      customClass: options?.customClass,
    };
    _mockToasts.push(newToast);
  },
);

export const mockError = vi.fn(
  (message: string, options?: ToastOptionParam) => {
    const newToast: InternalToastItem = {
      id: `mock-toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      message,
      type: "error",
      durationInSecond: options?.durationInSecond || 5,
      position: options?.position || "bottom-right",
      customClass: options?.customClass,
    };
    _mockToasts.push(newToast);
  },
);

export const mockInfo = vi.fn((message: string, options?: ToastOptionParam) => {
  const newToast: InternalToastItem = {
    id: `mock-toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    message,
    type: "info",
    durationInSecond: options?.durationInSecond || 5,
    position: options?.position || "bottom-right",
    customClass: options?.customClass,
  };
  _mockToasts.push(newToast);
});

export const mockWarning = vi.fn(
  (message: string, options?: ToastOptionParam) => {
    const newToast: InternalToastItem = {
      id: `mock-toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      message,
      type: "warning",
      durationInSecond: options?.durationInSecond || 5,
      position: options?.position || "bottom-right",
      customClass: options?.customClass,
    };
    _mockToasts.push(newToast);
  },
);

export const mockDismissAll = vi.fn(() => {
  _mockToasts.splice(0, _mockToasts.length);
});

export const mockRemoveToastById = vi.fn((id: string) => {
  const index = _mockToasts.findIndex((toast) => toast.id === id);
  if (index !== -1) {
    _mockToasts.splice(index, 1);
  }
});

export const getMockUseToastInstance = () => ({
  toasts: _mockToasts,
  success: mockSuccess,
  error: mockError,
  info: mockInfo,
  warning: mockWarning,
  dismissAll: mockDismissAll,
  removeToastById: mockRemoveToastById,

  reset: () => {
    _mockToasts.splice(0);
    mockSuccess.mockClear();
    mockError.mockClear();
    mockInfo.mockClear();
    mockWarning.mockClear();
    mockDismissAll.mockClear();
    mockRemoveToastById.mockClear();
  },
});
