<template>
  <div class="flex flex-col justify-center rounded-[10px] bg-white">
    <div
      :class="[
        'flex items-center gap-x-4 pl-4 2xl:pl-6 pr-8 2xl:pr-10',
        link ? 'py-2' : 'py-4 2xl:py-6',
      ]"
    >
      <slot name="icon" />
      <div>
        <h3
          class="primary-text font-bold text-xl"
          data-cy="dashboard-card-value"
        >
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
    <NuxtLink
      v-if="link"
      :to="link"
      class="block mt-2 text-blue-600 text-center bg-primary/10 px-2 py-1 text-xs xl:text-sm rounded-bl-[10px] rounded-br-[10px] duration-100 ease hover:bg-primary/15"
      data-cy="dashboard-card-link"
    >
      {{ linkLabel }} →
    </NuxtLink>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  value: number;
  description: string;
  link?: string;
  linkLabel?: string;
}>();
</script>
