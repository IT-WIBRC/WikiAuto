<template>
  <div class="custom-grid">
    <h1
      class="text-primary-text font-bold text-xl 2xl:text-2xl"
      data-cy="content-list-title"
    >
      {{ t("ttl") }}
    </h1>
    <div class="pr-8 flex justify-end items-center">
      <BaseButtonIcon
        data-cy="go-to-content-create"
        :text="t('add_btn')"
        @click="openContentCreationForm"
      >
        <template #icon>
          <IconAdd class="fill-white stroke-white h-4 w-4" />
        </template>
      </BaseButtonIcon>
    </div>
    <div class="pr-8">
      <template v-if="isContentListLoading">
        <div class="relative h-full">
          <LoaderFade
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 before:w-10 before:border-t-primary before:h-10 before:left-1/2 before:top-1/2"
          />
        </div>
      </template>
      <template v-else>
        <DataTable
          v-if="getContents.length > 0"
          :headers="headers"
          :items="getContents"
        >
          <template #default="{ item, header }">
            <td v-if="header.key === 'status'">
              <BadgeStatus
                :text="item.getTextFor(header.key)"
                :theme="item.getTextFor(header.key).toLowerCase()"
              />
            </td>
            <td v-else-if="header.key === 'badges'">
              <div class="flex items-center h-full gap-x-3">
                <Badge
                  v-for="badge in item.getTextFor(header.key)"
                  :key="badge"
                  :text="badge"
                  :data-cy="badge"
                />
              </div>
            </td>
            <td v-else-if="header.key === 'email'">
              <address>
                {{ item.getTextFor(header.key) }}
              </address>
            </td>
            <td v-else class="pl-4 py-5">
              <p>
                {{ item.getTextFor(header.key) }}
              </p>
            </td>
          </template>
        </DataTable>
        <div
          v-else
          class="h-full flex flex-col justify-center items-center"
          data-cy="empty-content-list"
        >
          <IconBlankContent class="h-60 xl:h-80 fill-gray-400" />
          <div class="text-primary/40 text-xl" data-cy="no-content">
            {{ t("not_content") }}
          </div>
        </div>
      </template>
    </div>
    <teleport to="body">
      <Transition name="nested">
        <section
          v-if="isContentCreationFormOpened"
          class="w-full bg-primary-text/30 shadow h-svh fixed top-0 left-0 z-20 flex"
        >
          <div
            class="w-full h-full bg-transparent cursor-pointer"
            @click.stop="closeContentCreationForm"
          />
          <client-only>
            <ContentCreate
              class="w-[700px] bg-white h-full inner"
              @close="closeContentCreationForm"
              @created="getContentList"
            />
          </client-only>
        </section>
      </Transition>
    </teleport>
  </div>
</template>
<script setup lang="ts">
import type { DataHeader, DataItem } from "~/components/DataTable.vue";
import type { GetContentListType } from "~/api/types";

definePageMeta({
  layout: "admin",
  middleware: ["auth-middleware"],
});

const { t } = useI18n({
  useScope: "local",
  messages: {
    en: {
      ttl: "Content List",
      not_content: "No content created yet.",
      headers: {
        title_th: "Title",
        email_th: "Email",
        status_th: "Status",
        badge_th: "Badges",
      },
      generic_errors: {
        REQUEST_FAILED: "Request to retrieve list of contents failed.",
      },
      add_btn: "Add a content",
    },
    fr: {
      ttl: "Content list",
      not_content: "Pas encore de contenu cree",
      headers: {
        title_th: "Titre",
        email_th: "Email",
        status_th: "Status",
        badge_th: "Tags",
      },
      generic_errors: {
        REQUEST_FAILED:
          "Échec de la demande d'extraction de la liste des contenus.",
      },
      add_btn: "Ajouter un contenue",
    },
  },
});

type HeaderKeys = "title" | "email" | "status" | "badges";
const headers: DataHeader<Keys>[] = Object.seal([
  {
    key: "title",
    value: t("headers.title_th"),
  },
  {
    key: "email",
    value: t("headers.email_th"),
  },
  {
    key: "badges",
    value: t("headers.badge_th"),
  },
  {
    key: "status",
    value: t("headers.status_th"),
  },
]) as const;

class DataForContent implements DataItem<HeaderKeys> {
  constructor(private content: GetContentListType) {}

  getTextFor(key: Keys): string | string[] | number {
    switch (key) {
      case "title":
        return this.content.title;
      case "email":
        return this.content.user_email;
      case "status":
        return this.content.status;
      case "badges":
        return this.content.badges.map((badge) => badge.name);
      default:
        return "-";
    }
  }

  get id(): string {
    return this.content.content_id;
  }
}

const contentList = ref<GetContentListType[]>([]);
const getContentList = async (): Promise<void> => {
  const contents = await useContentStore().fetchContentList();
  if (contents.status === "success") {
    contentList.value = contents.data.sort((firstContent, secondContent) =>
      useDate.difference(secondContent.updated_at, firstContent.updated_at),
    );
    return;
  }
  useToast.setDuration(15).error(t(`generic_errors.${t(contents.message)}`));
};

const isContentListLoading = shallowRef(false);
onBeforeMount(async () => {
  isContentListLoading.value = true;
  await getContentList();
  isContentListLoading.value = false;
});

const getContents = computed<DataForContent[]>(() => {
  return contentList.value.map((content) => new DataForContent(content));
});

const isContentCreationFormOpened = shallowRef(false);
const openContentCreationForm = (): void => {
  isContentCreationFormOpened.value = true;
};

const closeContentCreationForm = (): void => {
  isContentCreationFormOpened.value = false;
};
</script>
<style scoped>
.custom-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 90px 50px 1fr;
  height: 100svh;
  max-height: calc(100svh - 2rem);
}

.nested-enter-active,
.nested-leave-active {
  transition: opacity 0.5s ease;
}

.nested-enter-from,
.nested-leave-to {
  opacity: 0;
}

.nested-enter-active .inner,
.nested-leave-active .inner {
  transition: all 0.3s ease-in-out;
}

.nested-enter-from .inner,
.nested-leave-to .inner {
  transform: translateX(30px);
  opacity: 0;
}

.nested-enter-active .inner {
  transition-delay: 0.25s;
}
</style>
<style>
table tbody tr td:first-child p {
  @apply w-[400px] xl:w-[500px] 2xl:w-[500px] truncate;
}
</style>
