import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    include: ["**/*.spec.ts", "**/*.test.ts", "**/*.nuxt.spec.ts"],
    setupFiles: ["dotenv/config", "./vitest.setup.ts"],
    environmentOptions: {
      nuxt: {
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
        "**/__tests__/**",
        "**/*.spec.ts",
        "**/cypress/**",
        "**/skeleton/**",
      ],
    },
  },
});
