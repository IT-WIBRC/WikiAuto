<template>
  <div class="flex">
    <SkeletonDashboardCard v-if="isTotalContentLoading" />
    <CardDashboardBase v-else :value="totalContent" :description="t('total')">
      <template #icon>
        <div
          class="rounded-full h-10 w-10 2xl:h-12 2xl:w-12 flex items-center justify-center bg-primary/30"
        >
          <IconContent class="h-5 2xl:h-6 2xl:w-6 w-5 fill-primary" />
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
      total: "Total content",
    },
    fr: {
      total: "Contenu total",
    },
  },
});

const totalContent = ref("0");

const isTotalContentLoading = ref(false);
const getTotalContent = async (): Promise<void> => {
  isTotalContentLoading.value = true;
  const totalContentErrorOrValue = await useContentStore().fetchTotalContent();
  if (totalContentErrorOrValue.status === "success") {
    totalContent.value = totalContentErrorOrValue.data.toString();
  }
  isTotalContentLoading.value = false;
};

onBeforeMount(async () => {
  await getTotalContent();
});
</script>
