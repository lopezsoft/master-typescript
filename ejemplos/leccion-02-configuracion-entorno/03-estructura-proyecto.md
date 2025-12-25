# Estructura de Proyecto TypeScript

Guía de mejores prácticas para organizar proyectos TypeScript, desde aplicaciones simples hasta monorepos empresariales.

---

## 📁 Proyecto Simple (Aplicación Standalone)

### Estructura Básica

```
my-app/
├── src/
│   ├── index.ts          # Punto de entrada
│   ├── config/
│   │   └── database.ts
│   ├── models/
│   │   ├── user.ts
│   │   └── index.ts      # Barrel export
│   ├── services/
│   │   ├── user.service.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── validators.ts
│   └── types/
│       └── index.ts      # Tipos compartidos
├── tests/
│   ├── unit/
│   └── integration/
├── dist/                 # Compilado (gitignore)
├── node_modules/         # Dependencias (gitignore)
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tsconfig.build.json   # Config para build de producción
└── README.md
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "baseUrl": "./",
    "paths": {
      "@config/*": ["src/config/*"],
      "@models/*": ["src/models/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### package.json

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

---

## 🏗️ Proyecto NestJS (Framework Enterprise)

### Estructura Recomendada

```
nestjs-app/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/                    # Código compartido
│   │   ├── decorators/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── middleware/
│   │       └── logger.middleware.ts
│   ├── config/                    # Configuración
│   │   ├── config.module.ts
│   │   ├── database.config.ts
│   │   └── app.config.ts
│   ├── modules/                   # Features por módulo
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   └── update-user.dto.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   ├── interfaces/
│   │   │   │   └── user.interface.ts
│   │   │   └── tests/
│   │   │       ├── users.controller.spec.ts
│   │   │       └── users.service.spec.ts
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   └── products/
│   │       └── ...
│   └── shared/                    # Código compartido entre módulos
│       ├── services/
│       │   └── database.service.ts
│       └── utils/
│           └── helpers.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── dist/
├── node_modules/
├── .env
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

### nest-cli.json

```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": false,
    "tsConfigPath": "tsconfig.build.json"
  }
}
```

---

## 🏢 Monorepo (Múltiples Paquetes)

### Estructura con Workspaces (npm/yarn/pnpm)

```
my-monorepo/
├── packages/
│   ├── shared/                   # Código compartido
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── api/                      # Backend API
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   ├── main.ts
│   │   │   └── app.module.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                      # Frontend Web
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── App.tsx
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── cli/                      # CLI Tool
│       ├── src/
│       │   ├── commands/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── tools/                        # Scripts y herramientas
│   └── build.ts
│
├── package.json                  # Root package.json
├── tsconfig.base.json            # Config base compartida
├── pnpm-workspace.yaml           # o lerna.json
└── README.md
```

### package.json (root)

```json
{
  "name": "my-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "dev:api": "pnpm --filter api dev",
    "dev:web": "pnpm --filter web dev"
  }
}
```

### tsconfig.base.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "incremental": true
  }
}
```

### packages/shared/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### packages/api/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "paths": {
      "@my-monorepo/shared": ["../shared/src"]
    }
  },
  "references": [
    { "path": "../shared" }
  ],
  "include": ["src/**/*"]
}
```

---

## 📦 Biblioteca/Package (Para npm)

### Estructura para Publicar

```
my-library/
├── src/
│   ├── index.ts              # Export principal
│   ├── core/
│   │   ├── logger.ts
│   │   └── index.ts          # Barrel
│   ├── utils/
│   │   ├── validators.ts
│   │   └── index.ts
│   └── types/
│       └── index.ts
├── dist/                     # Build output
│   ├── index.js
│   ├── index.d.ts
│   └── ...
├── tests/
├── examples/                 # Ejemplos de uso
│   └── basic-usage.ts
├── docs/
├── .npmignore
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

### package.json (biblioteca)

```json
{
  "name": "@myorg/my-library",
  "version": "1.0.0",
  "description": "My TypeScript library",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["typescript", "library"],
  "author": "Your Name",
  "license": "MIT"
}
```

### tsconfig.json (biblioteca)

```json
{
  "compilerOptions": {
    "target": "ES2015",           // Compatible con más entornos
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,          // Generar .d.ts
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests", "examples"]
}
```

---

## 🎯 Mejores Prácticas

### 1. **Barrel Exports (index.ts)**

```typescript
// src/models/index.ts
export * from './user';
export * from './product';
export * from './order';

// Ahora puedes importar:
import { User, Product, Order } from '@models';
```

### 2. **Separación por Capas**

```
src/
├── controllers/    # HTTP layer
├── services/       # Business logic
├── repositories/   # Data access
├── models/         # Domain models
└── dto/            # Data transfer objects
```

### 3. **Configuración por Entorno**

```
config/
├── default.ts
├── development.ts
├── production.ts
└── test.ts
```

### 4. **Nombres de Archivos Consistentes**

```
✅ user.service.ts
✅ user.controller.ts
✅ user.entity.ts
✅ create-user.dto.ts

❌ UserService.ts
❌ user_controller.ts
❌ UserEntity.ts
```

### 5. **Usar Path Aliases**

```json
{
  "paths": {
    "@app/*": ["src/*"],
    "@config/*": ["src/config/*"],
    "@models/*": ["src/models/*"]
  }
}
```

```typescript
// En vez de:
import { User } from '../../../models/user';

// Usa:
import { User } from '@models/user';
```

---

## 🔧 Archivos de Configuración Esenciales

### .gitignore

```
node_modules/
dist/
build/
*.log
.env
.env.local
coverage/
.DS_Store
```

### .env.example

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/mydb
JWT_SECRET=your-secret-key
```

### .eslintrc.js

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
```

### .prettierrc

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

---

## 📚 Recursos

- [NestJS Project Structure](https://docs.nestjs.com/first-steps)
- [TypeScript Handbook - Project Configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
- [npm Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
