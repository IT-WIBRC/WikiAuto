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
    <div class="pr-8 scroll-height scroll">
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
          <template #header>
            <th class="py-4 pl-3" data-cy="header">
              <IconKeyboardArrowDown class="-rotate-90 h-6 w-6" />
            </th>
            <th v-for="header in headers" :key="header.key" data-cy="header">
              {{ header.value }}
            </th>
          </template>
          <template #body="{ item }">
            <tr
              class="rounded-xl duration-150 ease-linear hover:bg-primary/15 font-dm-sans font-medium text-sm cursor-default"
              data-cy="table-row"
              :data-cy-id="`row-${item.id}`"
              :class="{
                'bg-primary/20 isOpened': currentContentOpened === item.id,
              }"
            >
              <td class="pl-2 py-6" data-cy="table-data">
                <IconKeyboardArrowDown
                  :class="[
                    'h-6 w-6 cursor-pointer duration-100 ease-linear rounded hover:shadow hover:shadow-primary/50',
                    { '-rotate-90': !(currentContentOpened === item.id) },
                  ]"
                  data-cy="open-details-icon"
                  @click.stop="setCurrentOpenedContentDetails(item.id)"
                />
              </td>
              <template v-for="headerKey in headers" :key="headerKey.key">
                <td v-if="headerKey.key === 'status'">
                  <BadgeStatus
                    :text="item.getTextFor('status')"
                    :theme="item.getTextFor('status').toLowerCase()"
                  />
                </td>
                <td v-else-if="headerKey.key === 'badges'">
                  <div
                    class="flex items-center h-full gap-x-3 w-[250px] xl:w-[400px]"
                  >
                    <BadgeList
                      :badges="item.getTextFor('badges')"
                      :badge-length-on-l-g="2"
                      :badge-length-on-x-l="4"
                      :badge-length-on-more-than-x-l="5"
                      data-cy="badge-list"
                    />
                  </div>
                </td>
                <td v-else-if="headerKey.key === 'email'">
                  <address>
                    <a
                      :href="'mailto:' + item.getTextFor('email')"
                      class="underline text-primary/90 font-bold"
                    >
                      {{ item.getTextFor("email") }}
                    </a>
                  </address>
                </td>
                <td v-else>
                  <p class="w-[300px] xl:w-[500px] 2xl:w-[600px] truncate">
                    {{ item.getTextFor("title") }}
                  </p>
                </td>
              </template>
            </tr>
            <client-only>
              <Transition name="slide-fade">
                <ContentRowDetails
                  v-if="currentContentOpened === item.id"
                  :id="item.id"
                  @edited="reopenContentDetailAfterEditionAndListUpdate"
                />
              </Transition>
            </client-only>
          </template>
        </DataTable>
        <BaseNoData
          v-else
          class="h-full"
          :message="t('not_content')"
          data-cy="empty-content-list"
        />
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
import type { Badge, GetContentListType } from "~/api/types";

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
        created_by_th: "Created by",
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
      not_content: "Aucun contenu n'a encore été créé.",
      headers: {
        title_th: "Titre",
        created_by_th: "Créé par",
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

type HeaderKeys = "title" | "email" | "badges" | "status";
const headers: DataHeader<HeaderKeys>[] = Object.seal([
  {
    key: "title",
    value: t("headers.title_th"),
  },
  {
    key: "email",
    value: t("headers.created_by_th"),
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

  getTextFor(key: HeaderKeys): string | Badge[] | number {
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
  new useToast()
    .setDuration(15)
    .setPosition("bottom right")
    .error(t(`generic_errors.${t(contents.message)}`), false);
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

const currentContentOpened = shallowRef("");
const closeOpenedContentDetails = (): void => {
  currentContentOpened.value = "";
};

const setCurrentOpenedContentDetails = (contentId: string): void => {
  if (currentContentOpened.value !== contentId) {
    currentContentOpened.value = contentId;
    return;
  }
  closeOpenedContentDetails();
};

const reopenContentDetailAfterEditionAndListUpdate = async (
  contentId: string,
): Promise<void> => {
  isContentListLoading.value = true;
  await getContentList();
  isContentListLoading.value = false;
  closeOpenedContentDetails();
  setCurrentOpenedContentDetails(contentId);
};
</script>
<style scoped>
.custom-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 90px 50px 1fr;
  height: 100svh;
  max-height: calc(100svh - 2rem);
  gap: 4px 0;
}

.scroll-height {
  max-height: calc(100svh - 140px);
}

.isOpened {
  @apply border-b-0;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20%);
  opacity: 0;
}
</style>
