# @orchestr-ai/config

Shared ESLint, TypeScript, and Prettier configurations for Orchestr-AI.

## Overview

This package provides standardized configurations for:
- ESLint (TypeScript, React, NestJS)
- TypeScript (base, NestJS, React)
- Prettier

## Usage

### ESLint

#### Base (TypeScript)
```javascript
// .eslintrc.js
module.exports = {
  extends: ['@orchestr-ai/config/eslint/base'],
};
```

#### NestJS
```javascript
// .eslintrc.js
module.exports = {
  extends: ['@orchestr-ai/config/eslint/nestjs'],
};
```

#### React
```javascript
// .eslintrc.js
module.exports = {
  extends: ['@orchestr-ai/config/eslint/react'],
};
```

### TypeScript

#### Base
```json
// tsconfig.json
{
  "extends": "@orchestr-ai/config/typescript/base"
}
```

#### NestJS
```json
// tsconfig.json
{
  "extends": "@orchestr-ai/config/typescript/nestjs",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### React
```json
// tsconfig.json
{
  "extends": "@orchestr-ai/config/typescript/react",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### Prettier

```javascript
// .prettierrc.js
module.exports = require('@orchestr-ai/config/prettier');
```

Or in `package.json`:
```json
{
  "prettier": "@orchestr-ai/config/prettier"
}
```

## Related Documentation

- [Tech Stack](../../memory_bank/tech_stack.md) - Technology choices

