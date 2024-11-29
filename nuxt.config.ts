import { resolve } from "path";

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/i18n',
    '@nuxt/test-utils/module',
     '@pinia/nuxt',
    "@nuxtjs/i18n"
  ],
  i18n: {
    vueI18n: "./i18n.config.ts",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_language',
    },
    locales: [
      {
        code: 'en',
        language: 'en-US'
      },
      {
        code: 'fr',
        language: 'fr-FR'
      }
    ],
    fallbackLocale: 'en',
    strategy: 'no_prefix',
  },
  alias: {
    "@": resolve(__dirname, "/"),
  },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
   public: {
     supabaseUrl: "",
     supabaseKey: "",
   }
  },
})