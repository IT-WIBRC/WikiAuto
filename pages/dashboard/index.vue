<template>
  <div class="text-center text-xl" data-cy="dashboard-welcome">
    Welcome to the dashboard
    <span class="italic font-bold">{{ user.currentUser.email }}</span>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth-middleware"],
});
const user = useUserStore();
</script>
