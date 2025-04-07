<template>
  <div class="flex flex-col justify-center items-center">
    <slot name="icon">
      <IconBlankContent class="h-60 xl:h-80 fill-primary-text/40" />
    </slot>
    <div class="text-primary/40 text-xl" data-cy="no-content">
      {{ message }}
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>
