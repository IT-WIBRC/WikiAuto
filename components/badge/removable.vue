<template>
  <div
    class="font-dm-sans text-sm font-semibold px-3.5 py-1 rounded-2xl bg-gray-200 flex justify-center items-center gap-x-2"
  >
    <span>{{ text }}</span>
    <IconClose
      class="h-2 w-2 fill-gray-800 cursor-pointer"
      @click="$emit('remove')"
    />
  </div>
</template>
<script setup lang="ts">
defineProps<{
  text: string;
}>();
defineEmits<{
  (e: "remove"): void;
}>();
</script>
