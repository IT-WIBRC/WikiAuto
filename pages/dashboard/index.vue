<template>
  <div
    class="h-svh max-h-svh overflow-y-auto bg-primary/5 flex gap-x-5"
    data-cy="dashboard-welcome"
  >
    <MenuSide class="border transition-all duration-150 ease-linear" />
    <div class="pt-8 space-y-6 2xl:space-y-10">
      <div>
        <h1
          class="text-primary-text font-bold text-xl 2xl:text-2xl"
          data-cy="dashboard-title"
        >
          {{ t("ttl") }}
        </h1>
      </div>
      <div class="flex">
        <CardDashboardTotalContent data-cy="total-content" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth-middleware"],
});

const { t } = useI18n({
  useScope: "local",
  messages: {
    en: {
      ttl: "Dashboard",
    },
    fr: {
      ttl: "Dashboard",
    },
  },
});
</script>
