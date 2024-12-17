<template>
  <div
    class="h-svh max-h-svh overflow-y-auto bg-[#F1F4FA] flex gap-x-5"
    data-cy="dashboard-welcome"
  >
    <MenuSide class="border transition-all duration-150 ease-linear" />
    <main class="pt-8 w-full">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth-middleware"],
});
</script>
