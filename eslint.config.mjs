// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  files: [
    "**/*.ts",
    "**/*.js",
    "**/*.vue",
    "*.vue",
    "**/*.mjs",
    "**/*.cjs",
    "**/*.mts",
  ],
  ignores: [
    "node_modules/**/*",
    "**/package-lock.json",
    ".husky/**/*",
    ".idea/**/*",
    "**/.vscode",
    "dist/**/*",
    "build/**/*",
    "coverage/",
    "**/.nuxt/**",
    "**/api/wikiAutoType.ts",
    "**/index.d.ts",
  ],
  rules: {
    "array-bracket-spacing": ["error", "never"],
    "arrow-spacing": 2,
    "class-methods-use-this": 0,
    "computed-property-spacing": ["error", "never"],

    "cypress/no-unnecessary-waiting": "off",

    indent: [
      "error",
      2,
      {
        SwitchCase: 1,
      },
    ],

    "key-spacing": [
      2,
      {
        afterColon: true,
      },
    ],

    "keyword-spacing": 2,
    "linebreak-style": "off",

    "lines-around-comment": [
      "error",
      {
        afterBlockComment: false,
        beforeBlockComment: false,
      },
    ],

    "lines-between-class-members": [
      "error",
      "always",
      {
        exceptAfterSingleLine: true,
      },
    ],

    "no-console": "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-unused-vars": "off",
    "no-useless-escape": "off",

    "object-curly-newline": [
      "error",
      {
        ImportDeclaration: {
          consistent: true,
          multiline: true,
        },
      },
    ],

    "object-curly-spacing": [2, "always"],

    "padding-line-between-statements": [
      "error",
      {
        blankLine: "always",
        next: "function",
        prev: "function",
      },
      {
        blankLine: "always",
        next: "class",
        prev: "class",
      },
    ],

    quotes: [
      "error",
      "double",
      {
        avoidEscape: true,
      },
    ],

    semi: [
      "error",
      "always",
      {
        omitLastInOneLineBlock: true,
      },
    ],

    "quote-props": ["error", "as-needed"],
    "sort-imports": "off",
    "space-before-blocks": 2,
    "space-before-function-paren": "off",
    "space-in-parens": ["error", "never"],

    "vue/max-len": [
      "error",
      {
        code: 80,
        comments: 80,
        ignoreComments: true,
        ignoreHTMLAttributeValues: true,
        ignoreHTMLTextContents: true,
        ignorePattern: "",
        ignoreRegExpLiterals: false,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreTrailingComments: false,
        ignoreUrls: true,
        tabWidth: 4,
        template: 80,
      },
    ],

    "object-property-newline": "error",
  },
});
