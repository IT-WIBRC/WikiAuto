<template>
  <div class="custom-grid">
    <h1
      class="text-primary-text font-bold text-xl 2xl:text-2xl"
      data-cy="user-profile-title"
    >
      {{ t("ttl") }}
    </h1>
    <div class="flex justify-center">
      <SectionProfile class="w-4/5 2xl:w-3/5" data-cy="profile-section" />
    </div>
  </div>
</template>
<script lang="ts" setup>
definePageMeta({
  layout: "admin",
  middleware: ["auth-middleware"],
});

const { t } = useI18n({
  useScope: "local",
  messages: {
    en: {
      ttl: "User Profile Management",
    },
    fr: {
      ttl: "Gestion du profile de l'utilisateur",
    },
  },
});
</script>
<style scoped>
.custom-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 100px 1fr;
  height: 100svh;
  max-height: calc(100svh - 2rem);
  gap: 4px 0;
}

.scroll-height {
  max-height: calc(100svh - 140px);
}
</style>
