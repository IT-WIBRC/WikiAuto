import { object, string } from "zod";
import type { Composer } from "vue-i18n";

export const MAX_TAG_LENGTH = 30;
export const MAX_DESCRIPTION_LENGTH = 60;
export const MIN_TAG_LENGTH = 2;

export const badgeTranslation = {
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
  },
};

export const getBadgeValidation = (t: Composer) => {
  return toTypedSchema(
    object({
      title: string()
        .min(
          MIN_TAG_LENGTH,
          t("name.error.moreThan", { length: MIN_TAG_LENGTH }),
        )
        .max(
          MAX_TAG_LENGTH,
          t("name.error.lessThan", { length: MAX_TAG_LENGTH }),
        ),
    }),
  );
};
