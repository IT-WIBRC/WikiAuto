import { toTypedSchema } from "@vee-validate/zod";
import { array, custom, nativeEnum, object, string } from "zod";
import type { Badge } from "~/api";
import { CONTENT_STATUS } from "~/api";
import type { Composer } from "vue-i18n";

const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
] as const;

const MAX_FILE_SIZE = 200 * 1024;

export const contentTranslation = {
  en: {
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
      status_lbl: "Status",
    },
  },
  fr: {
    _min: "Au moins {length} caractères",
    _max: "Au maximum {length} caractères",
    _file: "Doit être un fichier image",
    _size: "La taille du fichier doit être inférieure à 200 kb.",
    _fileTypes:
      "Seuls les types suivants sont autorisés .jpg, .jpeg, .png et .webp",
    fields: {
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
      status_lbl: "Status",
    },
  },
};

export const getContentValidation = (t: Composer) => {
  return toTypedSchema(
    object({
      title: string()
        .min(10, t("_min", { length: 10 }))
        .max(100, t("_max", { length: 100 })),
      explanation: string().min(20, t("_min", { length: 20 })),
      badges: array(custom<Badge>()).refine(
        (badges) => badges.length > 0,
        t("_min", { length: 1 }),
      ),
      status: nativeEnum(CONTENT_STATUS).default(CONTENT_STATUS.DRAFT),
      illustration: custom<File>((file) => file instanceof File, t("_file"))
        .refine(
          (file) => file.size > 0 && file.size <= MAX_FILE_SIZE,
          t("_size"),
        )
        .refine(
          (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
          t("_fileTypes"),
        ),
    }),
  );
};
