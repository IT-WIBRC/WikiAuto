import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import mockI18n from "./__mocks__/@nuxtjs/i18n";

mockNuxtImport("useI18n", () => mockI18n.useI18n);
