<template>
  <Transition :name="transitionName">
    <div
      v-if="show"
      class="fixed top-0 left-0 z-50 w-full h-full transition-opacity duration-300 ease-linear"
      data-test="modal-container-transition"
    >
      <slot />
    </div>
  </Transition>
</template>
<script setup lang="ts">
defineProps({
  show: {
    type: Boolean,
  },
  transitionName: {
    type: String,
    default: "modal",
  },
});
</script>
<style>
.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
