<template>
  <button
    class="flex min-h-11 rounded-lg px-5 bg-primary text-base font-medium text-white items-center gap-x-2.5 disabled:bg-gray-600/60 disabled:text-white disabled:cursor-not-allowed"
  >
    <slot name="icon" />
    <span>{{ text }}</span>
  </button>
</template>
<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>
