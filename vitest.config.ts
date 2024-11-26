import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
    test: {
        environment: "happy-dom",
        environmentOptions: {
          nuxt: {
            mock: {
              intersectionObserver: true,
            }
          }
        },
        coverage: {
            provider: "v8",
            reporter: ["text", "json-summary", "json"],
            reportOnFailure: true,
            thresholds: {
              lines: 50,
              branches: 50,
              functions: 50,
              statements: 50,
            },
            cleanOnRerun: true,
            exclude: [
              "**/icon/**",
              "**/assets/**",
              "**/*.config.*",
              "*.d.ts",
              "**/.nuxt/**",
              "**/__tests__/**",
              "**/*.spec.ts",
            ],
          },
      }
})
