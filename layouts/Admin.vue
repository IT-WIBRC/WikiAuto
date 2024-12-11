<template>
  <div
    class="h-svh max-h-svh overflow-y-auto bg-primary/5 flex gap-x-5"
    data-cy="dashboard-welcome"
  >
    <MenuSide class="border transition-all duration-150 ease-linear" />
    <main class="pt-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth-middleware"],
});
</script>
