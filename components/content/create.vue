<template>
  <div>
    <div
      class="flex items-center justify-between shadow-sm h-[10%] xl:h-[7%] px-4"
    >
      <h1
        class="text-primary-text font-bold font-dm-sans text-[22px]"
        data-cy="content-create-title"
      >
        {{ t("ttl") }}
      </h1>
      <button
        class="bg-[#605CFF] rounded-full h-8 w-8 flex items-center justify-center"
        title="close"
        data-cy="close-create-content-form"
        @click.stop="closeCreateContentForm"
      >
        <IconAdd class="rotate-45 h-3 w-3 fill-white" />
      </button>
    </div>
    <div
      class="scroll h-[90%] max-h-[90%] xl:h-[93%] xl:max-h-[93%] px-4 py-4"
      data-cy="content-creation"
    >
      <form
        class="space-y-4 flex flex-col justify-between h-full"
        @submit.prevent="create"
      >
        <div class="space-y-8">
          <InputFileImage
            v-model="illustration"
            :label="t('fields.illustration.lbl')"
            data-cy="illustration-input"
            :error-message="contentToCreateErrors.illustration"
          />
          <InputText
            v-model="title"
            :label="t('fields.title.lbl')"
            :is-required="true"
            :placeholder="t('fields.title.ph')"
            :limit-character="100"
            data-cy="title-input"
            :error-message="contentToCreateErrors.title"
          />
          <SelectMultipleForBadge
            v-model="badges"
            :label="t('fields.badge.lbl')"
            :placeholder="t('fields.badge.ph')"
            :is-required="true"
            data-cy="select-badge-input"
            :error-message="contentToCreateErrors.badges"
          />
          <InputRichText
            v-model="explanation"
            :placeholder="t('fields.explanation.ph')"
            :label="t('fields.explanation.lbl')"
            :is-required="true"
            data-cy="explanation-input"
            :error-message="contentToCreateErrors.explanation"
          />
        </div>
        <div class="flex flex-col justify-center gap-y-5">
          <button
            type="submit"
            class="w-full relative bg-primary-text cursor-pointer font-semibold text-white text-base border h-12 rounded-lg disabled:bg-gray-600/60 disabled:text-white disabled:cursor-not-allowed"
            data-cy="create-btn"
            :disabled="isCreationLoading"
          >
            <LoaderFade
              v-if="isCreationLoading"
              class="h-6 w-6 before:w-6 before:h-6 before:left-1/2"
            />
            <span v-else>
              {{ t("fields.button.create") }}
            </span>
          </button>
          <button
            class="w-full relative bg-primary cursor-pointer font-semibold text-white text-base border h-12 rounded-lg disabled:bg-gray-600/60 disabled:text-white disabled:cursor-not-allowed"
            data-cy="create-continue-btn"
            :disabled="isCreationAndContinueLoading"
            @click.prevent="createAndContinue"
          >
            <LoaderFade
              v-if="isCreationAndContinueLoading"
              class="h-6 w-6 before:w-6 before:h-6 before:left-1/2"
            />
            <span v-else>
              {{ t("fields.button.create_continue") }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { array, object, string, custom } from "zod";
import type { Badge } from "~/api/types";

const emits = defineEmits<{
  (e: "close" | "created"): void;
}>();

const closeCreateContentForm = (): void => {
  emits("close");
};

const { t } = useI18n({
  useScope: "local",
  messages: {
    en: {
      ttl: "Add Content",
      _min: "At least {length} characters long",
      _max: "At most {length} characters long",
      _file: "Must be an image file",
      _size: "File size should be less than 200kb.",
      _fileTypes: "Only these types are allowed .jpg, .jpeg, .png and .webp",
      fields: {
        title: {
          lbl: "Title",
          ph: "Enter your content title",
        },
        illustration: {
          lbl: "Upload your illustration",
        },
        explanation: {
          lbl: "Explanation",
          ph: "Write the explanation",
        },
        badge: {
          lbl: "Topics",
          ph: "Select topics",
        },
        button: {
          create: "Create",
          create_continue: "Create and continue",
        },
      },
      generic_errors: {
        BAD_REQUEST:
          "Creation failed due to the data provide, please check again",
        REQUEST_FAILED:
          "Looks like the operation has failed 🥲, please try again",
      },
      succeed: "Content created successfully 🥳",
    },
    fr: {
      ttl: "Ajouter un Contenue",
      fields: {
        _min: "Au moins {length} caractères",
        _max: "Au maximum {length} caractères",
        _file: "Doit être un fichier image",
        _size: "La taille du fichier doit être inférieure à 200 kb.",
        _fileTypes:
          "Seuls les types suivants sont autorisés .jpg, .jpeg, .png et .webp",
        title: {
          lbl: "Titre",
          ph: "Entez le titre de votre contenue",
        },
        illustration: {
          lbl: "Téléchargez votre illustration",
        },
        explanation: {
          lbl: "Explication",
          ph: "Ecrivez votre explication",
        },
        badge: {
          lbl: "Sujets",
          ph: "Selectionnez vos sujets",
        },
        button: {
          create: "Créer",
          create_continue: "créer et continue",
        },
      },
      generic_errors: {
        BAD_REQUEST:
          "La création a échoué en raison des données fournies, veuillez vérifier à nouveau.",
        REQUEST_FAILED:
          "Il semble que l'opération ait échoué 🥲, veuillez réessayer.",
      },
      succeed: "Contenu créé avec succès 🥳",
    },
  },
});

const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
] as const;
const MAX_FILE_SIZE = 200 * 1024;

const validationSchema = toTypedSchema(
  object({
    title: string()
      .min(10, t("_min", { length: 10 }))
      .max(100, t("_max", { length: 100 })),
    explanation: string().min(20, t("_min", { length: 20 })),
    badges: array(custom<Badge>()).refine(
      (badges) => badges.length > 0,
      t("_min", { length: 1 }),
    ),
    illustration: custom<File>((file) => file instanceof File, t("_file"))
      .refine((file) => file.size > 0 && file.size <= MAX_FILE_SIZE, t("_size"))
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        t("_fileTypes"),
      ),
  }),
);
const {
  handleReset,
  errors: contentToCreateErrors,
  validate,
} = useForm({
  validationSchema,
  initialValues: {
    title: "",
    explanation: "",
    badges: [],
    illustration: new File([], ""),
  },
});

const { value: title } = useField("title");
const { value: explanation } = useField("explanation");
const { value: badges } = useField("badges");
const { value: illustration } = useField("illustration");

const handleFormValidation = async (): Promise<boolean> => {
  const { valid } = await validate();
  return valid;
};

const contentStore = useContentStore();
const manageCreation = async (): Promise<"success" | "failed"> => {
  const isValid = await handleFormValidation();
  if (!isValid) return "failed";

  const creationResponse = await contentStore.create({
    title: title.value,
    explanation: explanation.value,
    illustration: illustration.value,
    badges: badges.value,
  });

  if (creationResponse.status === "success") {
    emits("created");
    useToast.setDuration(5).setPosition("top right").success(t("succeed"));
    return "success";
  }
  useToast
    .setDuration(5)
    .setPosition("top right")
    .error(t("generic_errors." + creationResponse.message));
  return "failed";
};

const isCreationLoading = shallowRef(false);
const create = async (): Promise<void> => {
  isCreationLoading.value = true;
  const creationStatus = await manageCreation();

  if (creationStatus === "success") {
    closeCreateContentForm();
  }
  isCreationLoading.value = false;
};

const isCreationAndContinueLoading = shallowRef(false);
const createAndContinue = async (): Promise<void> => {
  isCreationAndContinueLoading.value = true;
  const creationStatus = await manageCreation();
  if (creationStatus === "success") {
    handleReset();
  }
  isCreationAndContinueLoading.value = false;
};
</script>
