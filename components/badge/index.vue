<template>
  <div
    class="font-dm-sans text-xs font-medium px-3.5 py-1 rounded-2xl bg-gray-200"
  >
    {{ text }}
  </div>
</template>
<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>
