<template>
  <div
    v-if="toasts.length > 0"
    :class="[
      getGlobalContainerPositionClasses(toasts[0].position),
      'w-full sm:w-auto',
    ]"
    data-testid="global-toast-manager-container"
  >
    <TransitionGroup name="toast-list">
      <div
        v-for="toastItem in toasts"
        :id="toastItem.id"
        :key="toastItem.id"
        :class="[
          'relative overflow-hidden rounded-lg border-2 p-4 flex',
          'items-center gap-3',
          'min-w-[280px] sm:min-w-[320px] max-w-full sm:max-w-md',
          getToastTypeStyles(toastItem.type).backgroundColor,
          getToastTypeStyles(toastItem.type).borderColor,
          getToastTypeStyles(toastItem.type).shadow,
          toastItem.customClass,
        ]"
        role="status"
        aria-live="polite"
        data-testid="toast-container"
      >
        <div class="flex-shrink-0">
          <component
            :is="getIconComponent(toastItem.type)"
            class="w-6 h-6"
            :class="getToastTypeStyles(toastItem.type).iconColor"
            aria-hidden="true"
          />
        </div>

        <p
          class="flex-grow text-sm font-medium pr-8"
          :class="getToastTypeStyles(toastItem.type).textColor"
          data-testid="toast-message"
        >
          {{ toastItem.message }}
        </p>

        <button
          class="absolute top-2 right-2 p-1.5 rounded-full text-gray-400"
          :class="[
            'hover:text-gray-200 hover:bg-gray-700 focus:outline-none',
            'focus:ring-2 focus:ring-gray-500',
          ]"
          aria-label="Dismiss toast"
          data-testid="toast-close-button"
          @click="handleDismissToast(toastItem.id)"
        >
          <LazyIconClose class="h-2.5 w-2.5 fill-current" />
        </button>

        <div
          class="absolute bottom-0 left-0 w-full h-1 rounded-b-lg"
          :style="{
            backgroundColor: getToastTypeStyles(toastItem.type)
              .progressBarColor,
            animationDuration: `${toastItem.durationInSecond}s`,
            animationName: 'toast-progress-animation',
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards',
            transformOrigin: 'left',
          }"
          data-testid="toast-progress-bar"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { ToastType } from "~/types/toast";
import {
  LazyIconToastError,
  LazyIconToastInfo,
  LazyIconToastSuccess,
  LazyIconToastWarning,
  LazyIconClose,
} from "#components";

const { toasts, removeToastById } = useToast();

type ToastConfig = {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  progressBarColor: string;
  shadow: string;
};

const toastTypeStyles: Record<ToastType, ToastConfig> = {
  success: {
    backgroundColor: "bg-gray-800",
    borderColor: "border-green-500",
    textColor: "text-white",
    iconColor: "text-green-400",
    progressBarColor: "#22c55e",
    shadow: "shadow-xl shadow-green-500/20",
  },
  error: {
    backgroundColor: "bg-gray-800",
    borderColor: "border-red-500",
    textColor: "text-white",
    iconColor: "text-red-400",
    progressBarColor: "#ef4444",
    shadow: "shadow-xl shadow-red-500/20",
  },
  info: {
    backgroundColor: "bg-gray-800",
    borderColor: "border-blue-500",
    textColor: "text-white",
    iconColor: "text-blue-400",
    progressBarColor: "#3b82f6",
    shadow: "shadow-xl shadow-blue-500/20",
  },
  warning: {
    backgroundColor: "bg-gray-800",
    borderColor: "border-yellow-500",
    textColor: "text-white",
    iconColor: "text-yellow-400",
    progressBarColor: "#f59e0b",
    shadow: "shadow-xl shadow-yellow-500/20",
  },
} as const;

const getToastTypeStyles = (type: ToastType): ToastConfig => {
  return toastTypeStyles[type] || toastTypeStyles["info"];
};

const getIconComponent = (type: ToastType): Component => {
  switch (type) {
    case "success":
      return markRaw(LazyIconToastSuccess);
    case "error":
      return markRaw(LazyIconToastError);
    case "info":
      return markRaw(LazyIconToastInfo);
    case "warning":
      return markRaw(LazyIconToastWarning);
    default:
      return markRaw(LazyIconToastInfo);
  }
};

const getGlobalContainerPositionClasses = (position: string) => {
  const baseClasses = "fixed z-[9999] p-4 flex gap-2";
  switch (position) {
    case "top-left":
      return `${baseClasses} top-0 left-0 flex-col items-start`;
    case "top-right":
      return `${baseClasses} top-0 right-0 flex-col items-end`;
    case "bottom-left":
      return `${baseClasses} bottom-0 left-0 flex-col-reverse items-start`;
    case "bottom-right":
      return `${baseClasses} bottom-0 right-0 flex-col-reverse items-end`;
    default:
      return `${baseClasses} bottom-0 right-0 flex-col-reverse items-end`;
  }
};

const handleDismissToast = (id: string): void => {
  removeToastById(id);
};
</script>

<style>
@keyframes toast-progress-animation {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.5s ease-out;
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.toast-list-leave-active {
  position: absolute;
}
</style>
