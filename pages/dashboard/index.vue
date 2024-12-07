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
        <SkeletonDashboardCard v-if="isTotalContentLoading" />
        <BaseDashboardCard
          v-else
          :title="dashboardStatisticCards.content.total"
          :description="t('card.content.total')"
          data-cy="total-content"
        >
          <template #icon>
            <div
              class="rounded-full h-10 w-10 2xl:h-12 2xl:w-12 flex items-center justify-center bg-primary/30"
            >
              <IconContent class="h-5 2xl:h-6 2xl:w-6 w-5 fill-primary" />
            </div>
          </template>
        </BaseDashboardCard>
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
      card: {
        content: {
          total: "Total content",
        },
      },
    },
    fr: {
      ttl: "Dashboard",
      card: {
        content: {
          total: "Contenue total",
        },
      },
    },
  },
});

const dashboardStatisticCards = reactive({
  content: {
    total: "0",
  },
});

const isTotalContentLoading = ref(false);
const getTotalContent = async (): Promise<void> => {
  isTotalContentLoading.value = true;
  const totalContentErrorOrValue = await useContentStore().fetchTotalContent();
  if (totalContentErrorOrValue.status === "success") {
    dashboardStatisticCards.content.total =
      totalContentErrorOrValue.data.toString();
  }
  isTotalContentLoading.value = false;
};

onBeforeMount(async () => {
  await Promise.all([getTotalContent()]);
});
</script>
