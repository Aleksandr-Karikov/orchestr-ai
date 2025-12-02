import reactConfig from '@orchestr-ai/config/eslint/react';

/** @type {import('typescript-eslint').Config[]} */
export default [
  ...reactConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname || process.cwd(),
      },
    },
  },
  {
    ignores: [
      '*.config.js',
      '*.config.mjs',
      '.prettierrc.js',
      'eslint.config.mjs',
      'vitest.config.ts',
    ],
  },
];

