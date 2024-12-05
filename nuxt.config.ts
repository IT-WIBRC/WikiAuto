import { resolve } from "path";

export default defineNuxtConfig({
  modules: [
    "@nuxtjs/i18n",
    "@nuxt/test-utils/module",
    "@pinia/nuxt",
    "@nuxtjs/i18n",
    "@nuxt/eslint",
  ],
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      supabaseUrl: "",
      supabaseKey: "",
    },
  },
  alias: {
    "@": resolve(__dirname, "/"),
  },
  compatibilityDate: "2024-04-03",
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  i18n: {
    vueI18n: "./i18n.config.ts",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_language",
    },
    locales: [
      {
        code: "en",
        language: "en-US",
      },
      {
        code: "fr",
        language: "fr-FR",
      },
    ],
    fallbackLocale: "en",
    strategy: "no_prefix",
  },
});
