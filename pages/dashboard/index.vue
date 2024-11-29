<template>
  <div class="text-center text-xl">Welcome to the dashboard <span class="italic font-bold">{{ user.currentUser.email }}</span></div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});
const user = useUserStore();
</script>