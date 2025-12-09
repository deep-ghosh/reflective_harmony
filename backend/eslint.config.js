/**
 * ESLint configuration
 * Location: templates/eslint.config.js
 */
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  ignorePatterns: ["node_modules/", "dist/", "build/"],
  plugins: ["import", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    "prettier/prettier": [
      "error",
      {
        singleQuote: true,
        trailingComma: "all",
        printWidth: 100,
        endOfLine: "auto",
      },
    ],
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "warn",
    eqeqeq: ["error", "always"],
    curly: ["error", "all"],
    semi: ["error", "always"],
    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
  },
  settings: {
    "import/resolver": {
      node: { extensions: [".js", ".ts"] },
      typescript: {},
    },
  },
  overrides: [
    {
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: ["plugin:@typescript-eslint/recommended"],
    },
    {
      files: ["**/*.{test,spec}.{js,ts}"],
      env: { jest: true },
      rules: {
        "no-unused-expressions": "off",
      },
    },
  ],
};
