<template>
  <ModalLayout @closed="closeModal">
    <template #header>
      <div data-cy="preview">
        <Badge class="w-fit" :text="tagToCreate.name" />
      </div>
    </template>
    <template #body>
      <div class="space-y-6">
        <InputText
          v-model="tagToCreate.name"
          :label="t('name.lbl')"
          :placeholder="t('name.ph')"
          :is-required="true"
          :error-message="tagNameErrorMessage"
        />
        <InputText
          v-model="tagToCreate.description"
          :label="t('description.lbl')"
          :placeholder="t('description.ph')"
          :is-required="false"
        />
      </div>
    </template>
    <template #footer>
      <div class="w-full">
        <BaseButtonIcon
          :text="t('save_btn')"
          class="w-full justify-center"
          :disabled="isCreationProcessing"
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
const props = defineProps<{
  name: string;
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
        },
      },
      description: {
        lbl: "Description",
        ph: "Optional description",
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
          required: "Le nom est obligatoire",
          moreThan2: "Le nom doit comporter plus de 2 caractères",
        },
      },
      description: {
        lbl: "Description",
        ph: "Description facultative",
      },
      save_btn: "Sauvegarder",
      success: "Créé avec succès",
      failed: "Échec de la création",
    },
  },
});

onMounted(() => {
  tagToCreate.name = props.name;
});

const tagNameErrorMessage = shallowRef("");
const tagToCreate = reactive({
  name: "",
  description: "",
});

const closeModal = (): void => {
  emits("closed");
};

const isCreationProcessing = shallowRef(false);
const createTag = async (): Promise<void> => {
  isCreationProcessing.value = true;
  if (useString.isEmpty(tagToCreate.name)) {
    tagNameErrorMessage.value = t("name.error.required");
    isCreationProcessing.value = false;
    return;
  } else if (useString.isLessThan(tagToCreate.name, 2)) {
    isCreationProcessing.value = false;
    tagNameErrorMessage.value = t("name.error.moreThan2");
    return;
  }

  const creationResponse = await useBadgeStore().create(
    tagToCreate.name,
    tagToCreate.description,
  );
  if (creationResponse.status === "error") {
    useToast.error(t("failed"));
    isCreationProcessing.value = false;
    return;
  }
  useToast.success(t("success"));
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
