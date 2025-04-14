<template>
  <ModalLayout @closed="closeModal">
    <template #header>
      <div v-if="title" data-cy="preview">
        <Badge class="w-fit" :text="title" />
      </div>
    </template>
    <template #body>
      <div class="space-y-6 min-w-[400px]">
        <InputText
          v-model="title"
          :label="t('name.lbl')"
          :placeholder="t('name.ph')"
          :is-required="true"
          :error-message="badgeToCreateErrors.title"
          :limit-character="MAX_TAG_LENGTH"
          data-cy="field-title-input"
        />
        <InputText
          v-model="description"
          :label="t('description.lbl')"
          :placeholder="t('description.ph')"
          :is-required="false"
          :limit-character="MAX_DESCRIPTION_LENGTH"
          :error-message="errorMessage"
          data-cy="field-description-input"
        />
      </div>
    </template>
    <template #footer>
      <div class="w-full">
        <BaseButtonIcon
          :text="t('edit_btn')"
          class="w-full justify-center"
          :disabled="isEditionProcessing"
          data-cy="edit-badge-btn"
          @click.stop="edit"
        >
          <template #icon>
            <LazyLoaderFade
              v-if="isEditionProcessing"
              class="h-6 w-6 before:w-6 before:h-6 before:left-24"
            />
            <LazyIconTheme v-else class="h-4 w-4 fill-none stroke-white" />
          </template>
        </BaseButtonIcon>
      </div>
    </template>
  </ModalLayout>
  <div />
</template>
<script setup lang="ts">
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TAG_LENGTH,
  getBadgeValidation,
  badgeTranslation,
} from "./utils";
import type { Badge } from "~/api/types";

const props = defineProps<{
  id: string;
}>();

const emits = defineEmits<{
  (e: "closed" | "edited"): void;
}>();

const { t } = useI18n({
  useScope: "local",
  messages: {
    en: {
      ...badgeTranslation.en,
      edit_btn: "Edit",
      success: "Edited successfully",
      failed: "Failed to edit",
    },
    fr: {
      ...badgeTranslation.fr,
      edit_btn: "Editer",
      success: "Edité avec succès",
      failed: "Échec de la l'édition",
    },
  },
});

const closeModal = (): void => {
  emits("closed");
};

const badgeStore = useBadgeStore();
const findBadgeInTheList = (): Badge =>
  badgeStore.badgeList.find((badge) => badge.badge_id === props.id);

const validationSchema = getBadgeValidation(t);

const { errors: badgeToCreateErrors, validate } = useForm({
  validationSchema,
  initialValues: {
    title: "",
    description: "",
  },
});

const { value: title } = useField("title");
const { value: description } = useField("description");

const toast = new useToast();
onBeforeMount(async () => {
  const currentBadge = findBadgeInTheList();
  if (!currentBadge) {
    closeModal();
    toast.error(`No data with id ${props.id}`);
    return;
  }

  title.value = currentBadge.name;
  description.value = currentBadge.description;
});

const isEditionProcessing = shallowRef(false);
const errorMessage = shallowRef("");
const edit = async (): Promise<void> => {
  isEditionProcessing.value = true;
  const { valid: isValid } = await validate();

  if (!isValid) {
    isEditionProcessing.value = false;
    return;
  }

  if (
    description.value &&
    useString.isMoreThan(description.value, MAX_DESCRIPTION_LENGTH)
  ) {
    errorMessage.value = t("description.lessThan");
    isEditionProcessing.value = false;
    return;
  }

  const editionResponse = await useBadgeStore().edit({
    id: props.id,
    name: title.value,
    description: description.value || "",
  });

  if (editionResponse.status === "error") {
    toast.error(t("failed"));
    isEditionProcessing.value = false;
    return;
  }
  toast.success(t("success"));
  emits("edited");
  isEditionProcessing.value = false;
  closeModal();
};
</script>
<style>
.modal-container {
  width: 350px;
  @apply space-y-5;
}

.modal-footer {
  padding: 0 0 10px 0;
  @apply flex items-center justify-center w-full;
}
</style>
