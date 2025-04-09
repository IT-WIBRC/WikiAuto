<template>
  <div
    class="space-y-4 2xl:space-y-2 p-4 rounded-md shadow-sm border-b border-gray-200 bg-white"
  >
    <h4
      class="text-primary-text text-xl 2xl:text-2xl font-dm-sans font-semibold"
      data-cy="title"
    >
      {{ title }}
    </h4>
    <p
      class="text-gray-500 text-sm 2xl:text-base font-dm-sans"
      data-cy="description"
    >
      {{ description || "Description" }}
    </p>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>
