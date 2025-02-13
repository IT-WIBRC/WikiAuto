<template>
  <tr>
    <td class="bg-white pl-2 xl:pl-3" :colspan="5" :data-cy="id">
      <div
        class="w-full max-h-[280px] 2xl:max-h-[400px] scroll pr-2 xl:pr-3 py-2 2xl:py-4"
      >
        <div class="w-full flex gap-x-2 xl:gap-x-4">
          <div class="h-[276px] w-[250px] xl:h-[300px] xl:w-[300px] shrink-0">
            <div
              v-if="isContentImageUrlLoading"
              class="skeleton h-[276px] w-[250px] xl:h-[300px] xl:w-[300px] rounded-md"
            />
            <BaseImage
              v-else
              :alt="getCurrentContent.title"
              :name="getCurrentContent.title"
              :src-url="currentContentImageUrl"
              class="h-[276px] w-[250px] xl:h-[300px] xl:w-[300px] border rounded-md object-cover"
              loading="eager"
              fetch-priority="high"
              data-cy="illustration"
            />
          </div>
          <div
            class="w-full flex flex-col justify-between h-[276px] xl:h-[300px] divide-y border-b"
          >
            <div class="flex gap-x-4 xl:gap-x-8 items-center h-1/5">
              <ContentDetailWrapper :label="t('status_lbl')" data-cy="status">
                <template #content>
                  <BadgeStatus
                    :text="getCurrentContent.status"
                    :theme="getCurrentContent.status.toLowerCase()"
                  />
                </template>
              </ContentDetailWrapper>

              <ContentDetailWrapper
                :label="t('created_by_lbl')"
                data-cy="created_by"
              >
                <template #content>
                  <address class="text-xs xl:text-sm">
                    <a
                      :href="'mailto:' + getCurrentContent.userEmail"
                      class="underline text-primary/90 font-bold"
                    >
                      {{ getCurrentContent.userEmail }}
                    </a>
                  </address>
                </template>
              </ContentDetailWrapper>
              <ContentDetailWrapper
                :label="t('created_at_lbl')"
                data-cy="created_at"
              >
                <template #content>
                  <time class="text-xs xl:text-sm font-medium italic">
                    {{ getCurrentContent.created_at }}
                  </time>
                </template>
              </ContentDetailWrapper>
              <ContentDetailWrapper
                :label="t('updated_at_lbl')"
                data-cy="updated_at"
              >
                <template #content>
                  <time class="text-xs xl:text-sm font-medium italic">
                    {{ getCurrentContent.updated_at }}
                  </time>
                </template>
              </ContentDetailWrapper>
            </div>
            <div class="h-[38%] flex items-center">
              <ContentDetailWrapper :label="t('title_lbl')" data-cy="title">
                <template #content>
                  <h1
                    class="font-semibold text-base break-words 2xl:text-xl w-[98%]"
                  >
                    {{ getCurrentContent.title }}
                  </h1>
                </template>
              </ContentDetailWrapper>
            </div>
            <div class="flex items-center h-2/5">
              <ContentDetailWrapper :label="t('badges_lbl')" data-cy="badges">
                <template #content>
                  <div class="flex flex-wrap gap-2">
                    <Badge
                      v-for="badge in getCurrentContent.badges"
                      :key="badge"
                      :text="badge"
                      :data-cy="badge"
                    />
                  </div>
                </template>
              </ContentDetailWrapper>
            </div>
          </div>
        </div>
        <ContentDetailWrapper
          :label="t('explanation_lbl')"
          data-cy="explanation"
        >
          <template #content>
            <div
              data-cy="value"
              class="px-4 py-2 xl:px-4 text-sm xl:text-base rounded-md font-light font-dm-sans w-full min-h-24 max-h-32 scroll bg-primary/5"
              v-html="getCurrentContent.explanation"
            />
          </template>
        </ContentDetailWrapper>
      </div>
    </td>
  </tr>
</template>
<script lang="ts" setup>
import type { GetContentDetailsType } from "~/api/types";

const props = defineProps<{
  id: string;
}>();

const isContentImageUrlLoading = shallowRef(false);
const currentContentImageUrl = shallowRef("");
const getContentImageUrl = async (): Promise<void> => {
  isContentImageUrlLoading.value = true;
  const getImageUrlResponse = await contentStore.getImageURLFrom(
    currentContent.value.image,
  );
  if (getImageUrlResponse.status === "success") {
    currentContentImageUrl.value = getImageUrlResponse.data;
  }
  isContentImageUrlLoading.value = false;
};

const contentStore = useContentStore();
const currentContent = ref<GetContentDetailsType | undefined>(undefined);
const findContentInTheList = async (): Promise<void> => {
  currentContent.value = contentStore.contentList.find(
    (content) => content.content_id === props.id,
  );

  await getContentImageUrl();
};

onBeforeMount(async () => {
  await findContentInTheList();
});

const defaultContent = {
  title: "-",
  explanation: "-",
  badges: [] as string[],
  status: "",
  updated_at: "",
  created_at: "",
  userEmail: "",
} as const;

const getCurrentContent = computed<typeof defaultContent>(() => {
  const currentOne: GetContentDetailsType = currentContent.value;
  if (currentOne) {
    return {
      title: currentOne.title,
      explanation: currentOne.explanation,
      badges: currentOne.badges.map((badge) => badge.name),
      status: currentOne.status,
      updated_at: useDate.format(currentOne.updated_at),
      created_at: useDate.format(currentOne.created_at),
      userEmail: currentOne.user_email,
    };
  }
  return defaultContent;
});

const { t } = useI18n({
  useScope: "local",
  messages: {
    en: {
      title_lbl: "Title :",
      explanation_lbl: "Explanation :",
      badges_lbl: "Badges :",
      status_lbl: "Status :",
      created_by_lbl: "Created by :",
      created_at_lbl: "Created at :",
      updated_at_lbl: "Updated at :",
    },
    fr: {
      title_lbl: "Titre :",
      explanation_lbl: "Explication :",
      badges_lbl: "Sujets :",
      status_lbl: "Status :",
      created_by_lbl: "Créé par :",
      created_at_lbl: "Créé à :",
      updated_at_lbl: "Mise à jour à :",
    },
  },
});
</script>
