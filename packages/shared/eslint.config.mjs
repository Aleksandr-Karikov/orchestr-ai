import baseConfig from "@orchestr-ai/config/eslint/base";

/** @type {import('typescript-eslint').Config[]} */
export default [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname || process.cwd(),
      },
    },
  },
];
