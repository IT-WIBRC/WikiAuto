import { reactive, readonly } from "vue";
import type {
  ToastOptions,
  ToastType,
  ToastPosition,
  InternalToastItem,
  ToastOptionParam,
} from "~/types/toast";

const _toasts = reactive<InternalToastItem[]>([]);
let _toastCounter = 0;

const _removeToast = (id: string) => {
  const index = _toasts.findIndex((toast) => toast.id === id);
  if (index !== -1) {
    const [removedToast] = _toasts.splice(index, 1);
    if (removedToast.timeoutId) {
      clearTimeout(removedToast.timeoutId);
    }
  }
};

const removeToastById = (id: string) => {
  _removeToast(id);
};

export function useToast() {
  const showToast = (options: ToastOptions): void => {
    _toastCounter++;
    const id = `toast-${_toastCounter}-${Date.now()}`;
    const newToast: InternalToastItem = {
      id,
      message: options.message,
      type: options.type || "info",
      durationInSecond: options.durationInSecond || 5,
      position: options.position || "bottom-right",
      customClass: options.customClass,
    };

    _toasts.push(newToast);

    newToast.timeoutId = setTimeout(() => {
      _removeToast(id);
    }, newToast.durationInSecond * 1000);
  };

  const success = (message: string, options?: ToastOptionParam): void => {
    showToast({
      message,
      type: "success",
      ...options,
    });
  };

  const error = (message: string, options?: ToastOptionParam): void => {
    showToast({
      message,
      type: "error",
      ...options,
    });
  };

  const info = (message: string, options?: ToastOptionParam): void => {
    showToast({
      message,
      type: "info",
      ...options,
    });
  };

  const warning = (message: string, options?: ToastOptionParam): void => {
    showToast({
      message,
      type: "warning",
      ...options,
    });
  };

  const dismissAll = (): void => {
    _toasts.forEach((toast) => {
      if (toast.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
    });
    _toasts.splice(0, _toasts.length);
  };

  return {
    toasts: readonly(_toasts),
    success,
    error,
    info,
    warning,
    dismissAll,
    removeToastById,
  };
}

export type { ToastOptions, ToastType, ToastPosition, InternalToastItem };
