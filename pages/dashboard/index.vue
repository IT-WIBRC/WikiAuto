<template>
  <div class="space-y-6 2xl:space-y-10">
    <div>
      <h1
        class="text-primary-text font-bold text-xl 2xl:text-2xl"
        data-cy="dashboard-title"
      >
        {{ t("ttl") }}
      </h1>
    </div>
    <div class="flex gap-x-4">
      <CardDashboardTotalContent data-cy="total-content" />
      <CardDashboardTotalValidatedContent data-cy="total-validated-content" />
      <CardDashboardTotalBadge data-cy="total-badge" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "admin",
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

const userStore = useUserStore();
if (!userStore.hasAlreadyFetchUserProfile) {
  const userInformation = await userStore.getProfile();

  const toast = useToast();
  if (userInformation.status === "error") {
    toast.error(t(`generic_errors.${userInformation.message}`));
  }
}
</script>
