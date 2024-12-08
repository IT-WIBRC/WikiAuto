<template>
  <div
    class="flex items-center gap-x-4 rounded-[10px] bg-white py-4 pl-4 2xl:py-6 2xl:pl-6 pr-8 2xl:pr-10"
  >
    <slot name="icon" />
    <div>
      <h3 class="primary-text font-bold text-xl" data-cy="dashboard-card-value">
        {{ value }}
      </h3>
      <p
        class="text-primary-text/50 font-normal text-xs capitalize"
        data-cy="dashboard-card-description"
      >
        {{ description }}
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  value: string;
  description: string;
}>();
</script>
