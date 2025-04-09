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
import { toTypedSchema } from "@vee-validate/zod";
import { object, string } from "zod";

const MAX_TAG_LENGTH = 30;
const MAX_DESCRIPTION_LENGTH = 60;
const MIN_TAG_LENGTH = 2;

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
      name: {
        lbl: "Name",
        ph: "New tag name",
        error: {
          required: "Name is required",
          moreThan: "Name must be longer than {length} characters",
          lessThan: "The name must be less than {length} characters long",
        },
      },
      description: {
        lbl: "Description",
        ph: "Optional description",
        lessThan: "The description must be less than {length} characters long",
      },
      save_btn: "Save",
      success: "Created successfully",
      failed: "Failed to create",
    },
    fr: {
      name: {
        lbl: "Nom",
        ph: "Nouveau nom de thème",
        error: {
          moreThan: "Le nom doit comporter plus de {length} caractères",
          lessThan: "Le nom doit comporter moins de {length} caractères",
        },
      },
      description: {
        lbl: "Description",
        ph: "Description facultative",
        lessThan: "La description doit comporter moins de {length} caractères",
      },
      save_btn: "Sauvegarder",
      success: "Créé avec succès",
      failed: "Échec de la création",
    },
  },
});

const closeModal = (): void => {
  emits("closed");
};

const validationSchema = toTypedSchema(
  object({
    title: string()
      .min(MIN_TAG_LENGTH, t("name.error.moreThan", { length: MIN_TAG_LENGTH }))
      .max(MAX_TAG_LENGTH, t("name.error.lessThan", { length: MAX_TAG_LENGTH })),
  }),
);

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
