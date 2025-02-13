<template>
  <div class="flex gap-y-0.5 xl:gap-y-1 flex-col py-2">
    <label class="text-xs xl:text-sm 2xl:text-base font-semibold">{{
      label
    }}</label>
    <slot name="content" />
  </div>
</template>
<script setup lang="ts">
defineProps<{
  label: string;
}>();
</script>
