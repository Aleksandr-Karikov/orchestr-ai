import baseConfig from "./base.js";

/** @type {import('typescript-eslint').Config[]} */
export default [
  ...baseConfig,
  {
    rules: {
      // NestJS-specific overrides
      "@typescript-eslint/no-explicit-any": "off", // NestJS uses any in decorators
    },
  },
];
