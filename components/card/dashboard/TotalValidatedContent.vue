<template>
  <div class="flex">
    <SkeletonDashboardCard v-if="isTotalValidatedContentLoading" />
    <CardDashboardBase
      v-else
      :value="totalValidatedContent"
      :description="t('totalValidated')"
    >
      <template #icon>
        <div
          class="rounded-full h-10 w-10 2xl:h-12 2xl:w-12 flex items-center justify-center bg-primary/30"
        >
          <IconValidated class="h-5 2xl:h-6 2xl:w-6 w-5 fill-primary" />
        </div>
      </template>
    </CardDashboardBase>
  </div>
</template>
<script setup lang="ts">
import {
  realtimeObserver,
  type ListenEvent,
} from "~/api/realtime/realtimeObserver";

const { t } = useI18n({
  useScope: "local",
  messages: {
    en: {
      totalValidated: "Total validated content",
    },
    fr: {
      totalValidated: "Contenu total validé",
    },
  },
});

const totalValidatedContent = ref(0);
const isTotalValidatedContentLoading = ref(false);
const getTotalValidatedContent = async (): Promise<void> => {
  isTotalValidatedContentLoading.value = true;
  const totalValidatedContentErrorOrValue =
    await useContentStore().fetchTotalContentValidated();
  if (totalValidatedContentErrorOrValue.status === "success") {
    totalValidatedContent.value = totalValidatedContentErrorOrValue.data;
  }
  isTotalValidatedContentLoading.value = false;
};

const triggeringEvents: ListenEvent[] = ["INSERT", "UPDATE"];
const handler = ({ eventType, new: newRow, old: oldRow }): void => {
  if (eventType === "INSERT" && newRow?.status === "VALIDATED") {
    totalValidatedContent.value++;
  }
  if (eventType === "UPDATE") {
    if (oldRow?.status !== "VALIDATED" && newRow?.status === "VALIDATED") {
      totalValidatedContent.value++;
    }
    if (oldRow?.status === "VALIDATED" && newRow?.status !== "VALIDATED") {
      totalValidatedContent.value--;
    }
  }
};

onBeforeMount(async () => {
  await getTotalValidatedContent();
  realtimeObserver.subscribe({
    forEvents: [...triggeringEvents],
    onTable: "contents",
    withHandler: handler,
  });
});

onBeforeUnmount(async () => {
  await realtimeObserver.unsubscribe({
    forEvents: [...triggeringEvents],
    fromTable: "contents",
    withHandler: handler,
  });
});
</script>
