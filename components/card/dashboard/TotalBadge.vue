<template>
  <div class="flex">
    <SkeletonDashboardCard v-if="isTotalBadgeLoading" />
    <CardDashboardBase v-else :value="totalBadges" :description="t('total')">
      <template #icon>
        <div
          class="rounded-full h-10 w-10 2xl:h-12 2xl:w-12 flex items-center justify-center bg-primary/30"
        >
          <IconBadge class="h-5 2xl:h-6 2xl:w-6 w-5 fill-primary" />
        </div>
      </template>
    </CardDashboardBase>
  </div>
</template>
<script setup lang="ts">
const { t } = useI18n({
  useScope: "local",
  messages: {
    en: {
      total: "Total badges",
    },
    fr: {
      total: "Sujets total",
    },
  },
});

const totalBadges = ref("0");

const isTotalBadgeLoading = ref(false);
const getTotalBadge = async (): Promise<void> => {
  isTotalBadgeLoading.value = true;
  const totalBadgeErrorOrValue = await useBadgeStore().fetchTotalBadges();
  if (totalBadgeErrorOrValue.status === "success") {
    totalBadges.value = totalBadgeErrorOrValue.data.toString();
  }
  isTotalBadgeLoading.value = false;
};

onBeforeMount(async () => {
  await getTotalBadge();
});
</script>
