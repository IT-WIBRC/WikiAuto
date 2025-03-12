<template>
  <div>
    <div
      class="flex items-center justify-between shadow-sm h-[10%] xl:h-[7%] px-4"
    >
      <h1
        class="text-primary-text font-bold font-dm-sans text-[22px]"
        data-cy="content-edit-title"
      >
        {{ t("ttl") }}
      </h1>
      <button
        class="bg-[#605CFF] rounded-full h-8 w-8 flex items-center justify-center"
        title="close"
        data-cy="close-edit-content-form"
        @click.stop="closeEditionContentForm"
      >
        <IconAdd class="rotate-45 h-3 w-3 fill-white" />
      </button>
    </div>
    <div
      class="scroll h-[90%] max-h-[90%] xl:h-[93%] xl:max-h-[93%] px-4 py-4"
      data-cy="content-edition"
    >
      <form
        class="space-y-4 flex flex-col justify-between h-full"
        @submit.prevent="edit"
      >
        <div class="space-y-8">
          <InputFileImage
            v-model="illustration"
            :label="t('fields.illustration.lbl')"
            data-cy="illustration-input"
            :error-message="contentToEditErrors.illustration"
          />

          <InputText
            v-model="title"
            :label="t('fields.title.lbl')"
            :is-required="true"
            :placeholder="t('fields.title.ph')"
            :limit-character="100"
            data-cy="title-input"
            :error-message="contentToEditErrors.title"
          />

          <SelectMultipleForBadge
            v-model="badges"
            :label="t('fields.badge.lbl')"
            :placeholder="t('fields.badge.ph')"
            :is-required="true"
            data-cy="select-badge-input"
            :error-message="contentToEditErrors.badges"
          />

          <SelectCustomForContentStatus
            v-model="status"
            :label="t('fields.status_lbl')"
            :is-required="true"
          />

          <InputRichText
            v-model="explanation"
            :placeholder="t('fields.explanation.ph')"
            :label="t('fields.explanation.lbl')"
            :is-required="true"
            data-cy="explanation-input"
            :error-message="contentToEditErrors.explanation"
          />
        </div>
        <div class="flex flex-col justify-center gap-y-5">
          <button
            type="submit"
            class="w-full relative bg-primary-text cursor-pointer font-semibold text-white text-base border h-12 rounded-lg disabled:bg-gray-600/60 disabled:text-white disabled:cursor-not-allowed"
            data-cy="edit-btn"
            :disabled="isEditionLoading"
          >
            <LoaderFade
              v-if="isEditionLoading"
              class="h-6 w-6 before:w-6 before:h-6 before:left-1/2"
            />
            <span v-else>
              {{ t("button.edit") }}
            </span>
          </button>
          <button
            class="w-full bg-primary-text/10 text-primary-text cursor-pointer font-semibold text-base border h-12 rounded-lg disabled:bg-gray-600/60 disabled:text-white disabled:cursor-not-allowed"
            data-cy="cancel-btn"
            @click.prevent="closeEditionContentForm"
          >
            {{ t("button.cancel") }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { GetContentDetailsType } from "~/api/types";
import {
  getContentValidation,
  contentTranslation,
} from "~/components/content/utils";

const emits = defineEmits<{
  (e: "close" | "edited"): void;
}>();

const props = defineProps<{
  id: string;
}>();

const closeEditionContentForm = (): void => {
  emits("close");
};

const { t } = useI18n({
  useScope: "local",
  messages: {
    en: {
      ttl: "Edit Content",
      ...contentTranslation.en,
      button: {
        edit: "Edit",
        cancel: "Cancel",
      },
      generic_errors: {
        BAD_REQUEST:
          "Edition failed due to the data provide, please check again",
        REQUEST_FAILED:
          "Looks like the operation has failed 🥲, please try again",
      },
      succeed: "Content edited successfully 🥳",
    },
    fr: {
      ttl: "Modifier le Contenue",
      ...contentTranslation.fr,
      button: {
        edit: "Editer",
        cancel: "Annuler",
      },
      generic_errors: {
        BAD_REQUEST:
          "L'édition a échoué en raison des données fournies, veuillez vérifier à nouveau.",
        REQUEST_FAILED:
          "Il semble que l'opération ait échoué 🥲, veuillez réessayer.",
      },
      succeed: "Contenu édité avec succès 🥳",
    },
  },
});

const currentContent = ref<GetContentDetailsType & { illustration?: File }>({
  title: "",
  status: "",
  badges: [],
  image: "",
  explanation: "",
  illustration: new File([], ""),
});

const createFileFromUrl = async (imageUrl: string): Promise<File> => {
  const response = await fetch(imageUrl);
  const data = await response.blob();
  return new File([data], currentContent.value.image, {
    type: data.type,
  });
};

const getContentImageUrl = async (): Promise<void> => {
  const getImageUrlResponse = await contentStore.getImageURLFrom(
    currentContent.value.image,
  );
  if (getImageUrlResponse.status === "success") {
    currentContent.value.illustration = await createFileFromUrl(
      getImageUrlResponse.data,
    );
  }
};

const findContentInTheList = async (): Promise<void> => {
  currentContent.value = contentStore.contentList.find(
    (content) => content.content_id === props.id,
  );

  await getContentImageUrl();
};

const validationSchema = getContentValidation(t);
const { errors: contentToEditErrors, validate } = useForm({
  validationSchema,
  initialValues: {
    title: "",
    explanation: "",
    badges: [],
    illustration: new File([], ""),
    status: "",
  },
});

const { value: title } = useField("title");
const { value: explanation } = useField("explanation");
const { value: badges } = useField("badges");
const { value: illustration } = useField("illustration");
const { value: status } = useField("status");

onBeforeMount(async () => {
  await findContentInTheList();

  title.value = currentContent.value.title;
  explanation.value = currentContent.value.explanation;
  badges.value = currentContent.value.badges;
  status.value = currentContent.value.status;
  illustration.value = currentContent.value.illustration;
});

const handleFormValidation = async (): Promise<boolean> => {
  const { valid } = await validate();
  return valid;
};

const contentStore = useContentStore();
const isEditionLoading = shallowRef(false);
const edit = async (): Promise<void> => {
  isEditionLoading.value = true;
  const isValid = await handleFormValidation();
  if (!isValid) return;

  const editionResponse = await contentStore.edit({
    id: props.id,
    title: title.value,
    explanation: explanation.value,
    illustration: illustration.value,
    badges: badges.value,
    status: status.value,
    userEmail: currentContent.value.user_email,
  });

  const toast = new useToast();
  if (editionResponse.status === "success") {
    toast.setDuration(12).setPosition("top right").success(t("succeed"), false);
    emits("edited");
    closeEditionContentForm();
    return;
  }
  toast
    .setDuration(10)
    .setPosition("top right")
    .error(t("generic_errors." + editionResponse.message), false);
  isEditionLoading.value = false;
};
</script>
