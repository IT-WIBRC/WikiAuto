<template>
  <div class="custom-grid">
    <h1
      class="text-primary-text font-bold text-xl 2xl:text-2xl"
      data-cy="badge-list-title"
    >
      {{ t("ttl") }}
    </h1>
    <div class="pr-8 flex justify-end items-center">
      <BaseButtonIcon
          data-cy="go-to-badge-create"
          :text="t('create_btn')"
          @click.stop="openBadgeCreationForm"
      >
        <template #icon>
          <IconAdd class="fill-white stroke-white h-4 w-4" />
        </template>
      </BaseButtonIcon>
    </div>
    <div class="pr-8 scroll-height scroll">
      <template v-if="isBadgeListLoading">
        <div class="relative h-full">
          <LoaderFade
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 before:w-10 before:border-t-primary before:h-10 before:left-1/2 before:top-1/2"
          />
        </div>
      </template>
      <template v-else>
        <div v-if="badgeGroup.length > 0" class="flex flex-wrap gap-x-4 gap-y-4">
          <CardBadge
            v-for="badge in badgeGroup"
            :key="badge.id"
            :title="badge.title"
            :description="badge.description"
            data-cy="badge"
            :data-cy-id="`badge-${badge.id}`"
          />
        </div>
        <BaseNoData
          v-else
          class="h-full"
          :message="t('no_badge')"
          data-cy="empty-badge-list"
        >
          <template #icon>
            <IconBadge class="h-60 xl:h-80 fill-primary-text/40" />
          </template>
        </BaseNoData>
      </template>
    </div>
    <teleport to="body">
      <client-only>
        <ModalTransition :show="isBadgeCreationFormOpened">
          <LazySelectCreateBadge
              @closed="closeBadgeCreationForm"
              @created="onBadgeCreationEnd"
          />
        </ModalTransition>
      </client-only>
    </teleport>
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
      ttl: "Badge List",
      no_badge: "No badge created yet.",
      generic_errors: {
        REQUEST_FAILED: "Request to retrieve list of badges failed.",
      },
      create_btn: "Create a badge",
    },
    fr: {
      ttl: "Badge list",
      no_badge: "Aucun badge n'a encore été créé.",
      generic_errors: {
        REQUEST_FAILED:
          "Échec de la demande d'extraction de la liste des badges.",
      },
      create_btn: "Créer a badge",
    },
  },
});

type Badge = {
  id: string;
  title: string;
  description: string;
};
const badgeGroup = ref<Badge[]>([]);
const getBadgeList = async (): Promise<void> => {
  const badgeListOrError = await useBadgeStore().fetchBadgeList();

  if (badgeListOrError.status === "success") {
    badgeGroup.value = [...badgeListOrError.data]
      .sort((firstBadge, secondBadge) =>
        useDate.difference(secondBadge.updated_at, firstBadge.updated_at),
      )
      .map((badge) => ({
        title: badge.name,
        description: badge.description,
        id: badge.badge_id,
      }));
    return;
  }

  new useToast()
    .setDuration(15)
    .setPosition("bottom right")
    .error(t(`generic_errors.${t(badgeListOrError.message)}`), false);
};

const isBadgeListLoading = shallowRef(false);
onBeforeMount(async () => {
  isBadgeListLoading.value = true;
  await getBadgeList();
  isBadgeListLoading.value = false;
});

const isBadgeCreationFormOpened = shallowRef(false);
const openBadgeCreationForm = (): void => {
  isBadgeCreationFormOpened.value = true;
};

const closeBadgeCreationForm = (): void => {
  isBadgeCreationFormOpened.value = false;
};

const onBadgeCreationEnd = async (): Promise<void> => {
  await getBadgeList();
  closeBadgeCreationForm();
};
</script>
<style scoped>
.scroll-height {
  max-height: calc(100svh - 140px);
}

.custom-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 50px 40px 1fr;
  height: 100svh;
  max-height: calc(100svh - 2rem);
  gap: 20px 0;
}
</style>
