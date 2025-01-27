<template>
  <div
    ref="modal"
    data-test="modal"
    class="absolute top-0 left-0 z-50 w-full h-full bg-black/50 flex font-Poppins cursor-pointer"
  >
    <div
      class="modal-container m-auto px-6 pt-12 pb-6 bg-white rounded-md transition-all duration-300 ease-linear relative cursor-default"
    >
      <div
        class="text-red-500 absolute right-1 duration-100 ease-linear hover:bg-red-100 top-1 h-7 w-7 flex items-center justify-center rounded-full cursor-pointer"
        data-test="close-modal"
        @click.prevent="$emit('closed')"
      >
        <IconClose class="h-3 w-3 fill-red-500" />
      </div>
      <div v-if="$slots.header" class="modal-header" data-test="modal-header">
        <slot name="header" />
      </div>

      <div
        v-if="$slots.body"
        class="modal-body my-2 mx-0"
        data-test="modal-body"
      >
        <slot name="body" />
      </div>

      <div v-if="$slots.footer" class="modal-footer" data-test="modal-footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import useDetectOutsideClick from "~/composables/useDetectOutsideClick";

const emits = defineEmits(["closed"]);
const closeOnEscape = (event: KeyboardEvent): void => {
  if (event.key === "Escape") {
    emits("closed");
  }
};

onMounted(() => {
  window.addEventListener("keyup", closeOnEscape);
});

onBeforeUnmount(() => {
  window.removeEventListener("keyup", closeOnEscape);
});

const modal = ref<HTMLDivElement | null>(null);
useDetectOutsideClick(modal, () => {
  emits("closed");
});
</script>
<style scoped>
.modal-container {
  min-width: 300px;
  max-width: 90%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}
</style>
