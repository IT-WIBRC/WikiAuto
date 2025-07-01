<template>
  <div class="flex">
    <SkeletonDashboardCard v-if="isTotalBadgeLoading" />
    <CardDashboardBase
      v-else
      :value="totalBadges"
      :description="t('total')"
      :link="badgeListRoute"
      :link-label="t('viewAllBadges')"
    >
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
import { realtimeObserver, type ListenEvent } from "~/api";
const badgeListRoute = "/badge";

const { t } = useI18n({
  useScope: "local",
  messages: {
    en: {
      total: "Total badges",
      viewAllBadges: "View all badges",
    },
    fr: {
      total: "Sujets total",
      viewAllBadges: "Voir tous les badges",
    },
  },
});

const totalBadges = ref(0);

const isTotalBadgeLoading = ref(false);
const getTotalBadge = async (): Promise<void> => {
  isTotalBadgeLoading.value = true;
  const totalBadgeErrorOrValue = await useBadgeStore().fetchBadgeCount();
  if (totalBadgeErrorOrValue.status === "success") {
    totalBadges.value = totalBadgeErrorOrValue.data;
  }
  isTotalBadgeLoading.value = false;
};

const handler = ({ eventType }: { eventType: ListenEvent }): void => {
  switch (eventType) {
    case "INSERT":
      totalBadges.value++;
      break;
    case "DELETE":
      totalBadges.value--;
      break;
  }
};

onBeforeMount(async () => {
  await getTotalBadge();
  realtimeObserver.subscribe({
    forEvents: ["INSERT", "DELETE"],
    onTable: "badges",
    withHandler: handler,
  });
});

onBeforeUnmount(async () => {
  await realtimeObserver.unsubscribe({
    forEvents: ["INSERT", "DELETE"],
    fromTable: "badges",
    withHandler: handler,
  });
});
</script>
