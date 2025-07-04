export type ToastPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  message: string;
  type?: ToastType;
  durationInSecond?: number;
  position?: ToastPosition;
  customClass?: string | string[];
}

export interface InternalToastItem extends ToastOptions {
  id: string;
  type: ToastType;
  durationInSecond: number;
  position: ToastPosition;
  timeoutId?: ReturnType<typeof setTimeout>;
}

export type ToastOptionParam = Omit<ToastOptions, "message" | "type">;
