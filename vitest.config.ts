import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    globals: true,
    include: [
      "**/{__tests__,tests}/**/*.{test,spec}.ts",
      "**/*.{test,spec}.ts",
    ],
    setupFiles: ["dotenv/config", "./vitest.setup.ts"],
    environmentOptions: {
      nuxt: {
        domEnvironment: "jsdom",
        mock: {
          intersectionObserver: true,
        },
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json"],
      reportOnFailure: true,
      thresholds: {
        lines: 70,
        branches: 70,
        functions: 70,
        statements: 70,
      },
      cleanOnRerun: true,
      exclude: [
        "**/icon/**",
        "**/assets/**",
        "**/*.config.*",
        "*.d.ts",
        "**/types/**",
        "./api/utils/monads.ts",
        "**/__mocks__/**",
        "**/tests/**",
        "**/.nuxt/**",
        "**/.output/**",
        "**/__tests__/**",
        "**/*.spec.ts",
        "**/cypress/**",
        "**/skeleton/**",
      ],
    },
  },
});
