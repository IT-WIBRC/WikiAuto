<template>
  <div>
    <button
      class="border border-transparent p-1.5 rounded-md transition duration-100 hover:border-gray-500"
      data-cy="open"
      @click="toggleDropdown"
    >
      <IconMore class="h-5 w-5 fill-gray-950" />
    </button>
    <div class="relative">
      <ul
        v-if="isOpened"
        data-cy="options"
        class="absolute bg-white shadow-md rounded-md border border-gray-100 right-1/2 px-2.5 py-2 top-2 space-y-2 min-w-48 w-auto max-w-56"
      >
        <slot name="options" />
      </ul>
    </div>
  </div>
</template>
<script setup lang="ts">
const isOpened = shallowRef(false);
const toggleDropdown = (): void => {
  isOpened.value = !isOpened.value;
};
</script>
<style>
ul li {
  @apply cursor-pointer px-1 py-1.5 rounded-md transition duration-75 hover:bg-primary/20;
}
</style>
