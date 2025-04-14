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
          :text="t('save_btn')"
          class="w-full justify-center"
          :disabled="isCreationProcessing"
          data-cy="create-badge-btn"
          @click.stop="createTag"
        >
          <template #icon>
            <LazyLoaderFade
              v-if="isCreationProcessing"
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

const props = defineProps<{
  name?: string;
}>();

const emits = defineEmits<{
  (e: "closed" | "created"): void;
}>();

const { t } = useI18n({
  useScope: "local",
  messages: {
    en: {
      ...badgeTranslation.en,
      save_btn: "Save",
      success: "Created successfully",
      failed: "Failed to create",
    },
    fr: {
      ...badgeTranslation.fr,
      save_btn: "Sauvegarder",
      success: "Créé avec succès",
      failed: "Échec de la création",
    },
  },
});

const closeModal = (): void => {
  emits("closed");
};

const validationSchema = getBadgeValidation(t);

const { errors: badgeToCreateErrors, validate } = useForm({
  validationSchema,
  initialValues: {
    title: props.name || "",
    description: "",
  },
});

const { value: title } = useField("title");
const { value: description } = useField("description");

const isCreationProcessing = shallowRef(false);
const errorMessage = shallowRef("");
const createTag = async (): Promise<void> => {
  isCreationProcessing.value = true;
  const { valid: isValid } = await validate();

  if (!isValid) {
    isCreationProcessing.value = false;
    return;
  }

  if (
    description.value &&
    useString.isMoreThan(description.value, MAX_DESCRIPTION_LENGTH)
  ) {
    errorMessage.value = t("description.lessThan");
    isCreationProcessing.value = false;
    return;
  }

  const creationResponse = await useBadgeStore().create(
    title.value,
    description.value || "",
  );
  const toast = new useToast();
  if (creationResponse.status === "error") {
    toast.error(t("failed"));
    isCreationProcessing.value = false;
    return;
  }
  toast.success(t("success"));
  emits("created");
  isCreationProcessing.value = false;
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
