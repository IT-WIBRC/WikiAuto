<template>
  <ModalLayout @closed="close">
    <template #header>
      <h2
        class="text-xl 2xl:text-2xl font-semibold text-center"
        data-cy="title"
      >
        {{ t("title_lbl") }}
      </h2>
    </template>
    <template #body>
      <div class="py-5 min-w-[400px]">
        <SelectCustomForContentStatus
          v-model="statusChose"
          :label="t('status_lbl')"
          :is-required="true"
        />
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-x-4">
        <button
          type="button"
          class="bg-blue-500 relative text-white px-4 rounded-md py-1.5 cursor-pointer disabled:bg-blue-400/40 disabled:cursor-not-allowed"
          :disabled="unableToSave"
          data-cy="update-btn"
          @click.stop="save"
        >
          <LoaderFade
            v-if="statusUpdateProcessing"
            class="h-6 w-6 before:w-6 before:h-6 before:left-1/2"
          />
          <span v-else>{{ t("btn.update") }}</span>
        </button>
        <button
          type="button"
          class="bg-gray-300 px-4 rounded-md py-1.5"
          data-cy="cancel-btn"
          @click="close"
        >
          {{ t("btn.cancel") }}
        </button>
      </div>
    </template>
  </ModalLayout>
</template>
<script setup lang="ts">
import type { CONTENT_STATUS } from "~/api";

const props = defineProps<{
  contentId: string;
  currentStatus: keyof typeof CONTENT_STATUS;
}>();
const emits = defineEmits<{
  (e: "close" | "updated"): void;
}>();

const { t } = useI18n({
  useScope: "local",
  messages: {
    en: {
      title_lbl: "Update status",
      btn: {
        update: "Update",
        cancel: "Cancel",
      },
      status_lbl: "Status",
      response: {
        success: "Status updated with success 🥳",
        failure: "Failed to update",
      },
    },
    fr: {
      title_lbl: "Modification du status",
      btn: {
        update: "Modifier",
        cancel: "Annuler",
      },
      status_lbl: "Status",
      response: {
        success: "Status mis à jour avec succèss 🥳",
        failure: "Échec de la mise à jour",
      },
    },
  },
});

const close = (): void => {
  emits("close");
};

const statusChose = shallowRef<keyof typeof CONTENT_STATUS>(
  props.currentStatus,
);
const unableToSave = computed<boolean>(
  () => props.currentStatus === statusChose.value,
);

const statusUpdateProcessing = shallowRef(false);
const toast = useToast();
const save = async (): Promise<void> => {
  statusUpdateProcessing.value = true;
  const statusUpdateResponse = await useContentStore().editStatus(
    statusChose.value,
    props.contentId,
  );

  if (statusUpdateResponse.status === "error") {
    toast.error(t("response.failure"));
  } else {
    toast.success(t("response.success"));
    emits("updated");
  }
  statusUpdateProcessing.value = false;
};
</script>
