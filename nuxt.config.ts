import { resolve } from "path";

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  components: [
    {
      path: "~/components",
      extensions: ["vue"],
      ignore: ["**/*.spec.*", "**/__tests__/**", "**/tests/**"],
    },
  ],
  modules: [
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@nuxt/eslint",
    "@vee-validate/nuxt",
    "@nuxtjs/supabase",
    "@nuxt/test-utils/module",
  ],
  supabase: {
    cookieOptions: {
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    types: "./shared/types/database.types.ts",
    url: process.env.NUXT_PUBLIC_DATABASE_URL,
    key: process.env.NUXT_PUBLIC_DATABASE_CLIENT_KEY,
    redirectOptions: {
      login: "/auth",
      callback: "/confirm",
      exclude: ["/"],
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
    defaultLocale: "en",
    strategy: "no_prefix",
  },
  veeValidate: {
    autoImports: true,
  },
  alias: {
    "~": resolve(__dirname, "."),
    "@": resolve(__dirname, "."),
  },
  css: ["~/assets/css/main.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      databaseUrl: process.env.NUXT_PUBLIC_DATABASE_URL,
      databaseClientKey: process.env.NUXT_PUBLIC_DATABASE_CLIENT_KEY,
    },
  },
});
