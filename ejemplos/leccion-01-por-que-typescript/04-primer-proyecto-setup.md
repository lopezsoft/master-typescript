# Lección 01 - Primer Proyecto con TypeScript

Guía paso a paso para crear tu primer proyecto TypeScript desde cero.

## 📋 Requisitos Previos

```bash
# Verificar versiones instaladas
node --version    # v18.0.0 o superior recomendado
npm --version     # v9.0.0 o superior recomendado
```

Si no tienes Node.js instalado: [https://nodejs.org](https://nodejs.org)

---

## 🚀 Opción 1: Proyecto TypeScript Básico (Node.js)

### 1. Crear directorio del proyecto

```bash
mkdir mi-proyecto-typescript
cd mi-proyecto-typescript
```

### 2. Inicializar npm

```bash
npm init -y
```

Esto crea `package.json`:

```json
{
  "name": "mi-proyecto-typescript",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

### 3. Instalar TypeScript

```bash
npm install --save-dev typescript @types/node
```

- `typescript`: El compilador de TypeScript
- `@types/node`: Tipos para Node.js APIs

### 4. Crear configuración de TypeScript

```bash
npx tsc --init
```

Esto crea `tsconfig.json`. Configuración recomendada para empezar:

```json
{
  "compilerOptions": {
    /* Language and Environment */
    "target": "ES2022",
    
    /* Modules */
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    
    /* JavaScript Support */
    "allowJs": false,
    
    /* Emit */
    "sourceMap": true,
    "removeComments": true,
    
    /* Interop Constraints */
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    
    /* Type Checking */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    
    /* Completeness */
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 5. Crear estructura de carpetas

```bash
mkdir src
mkdir dist
```

Estructura resultante:

```
mi-proyecto-typescript/
├── node_modules/
├── src/
│   └── (archivos .ts aquí)
├── dist/
│   └── (archivos .js compilados aquí)
├── package.json
├── package-lock.json
└── tsconfig.json
```

### 6. Crear archivo principal

Crear `src/index.ts`:

```typescript
// src/index.ts
interface User {
  id: number;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return `¡Hola, ${user.name}!`;
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
};

console.log(greetUser(user));
```

### 7. Agregar scripts a package.json

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc && node dist/index.js"
  }
}
```

### 8. Compilar y ejecutar

```bash
# Compilar TypeScript a JavaScript
npm run build

# Ejecutar el programa
npm start

# O hacer ambas cosas
npm run dev
```

### 9. (Opcional) Modo watch para desarrollo

Instalar `ts-node` y `nodemon` para desarrollo más rápido:

```bash
npm install --save-dev ts-node nodemon
```

Agregar script en `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc && node dist/index.js",
    "watch": "nodemon --watch src --exec ts-node src/index.ts"
  }
}
```

Ahora puedes desarrollar con hot-reload:

```bash
npm run watch
```

### 10. (Opcional) Agregar linting con ESLint

```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Crear `.eslintrc.json`:

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

Agregar script:

```json
{
  "scripts": {
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  }
}
```

### 11. (Opcional) Agregar Prettier

```bash
npm install --save-dev prettier
```

Crear `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 90
}
```

Agregar scripts:

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\""
  }
}
```

---

## 🎨 Opción 2: Proyecto TypeScript con Frontend (Vite)

Para proyectos con interfaz web moderna:

```bash
# Con npm
npm create vite@latest mi-app-typescript -- --template vanilla-ts

# O con React
npm create vite@latest mi-app-react -- --template react-ts

# O con Vue
npm create vite@latest mi-app-vue -- --template vue-ts
```

```bash
cd mi-app-typescript
npm install
npm run dev
```

---

## 🏗️ Opción 3: Proyecto TypeScript con Next.js

Para aplicaciones web full-stack:

```bash
npx create-next-app@latest mi-app-nextjs --typescript
cd mi-app-nextjs
npm run dev
```

---

## 🔧 Opción 4: Proyecto TypeScript con NestJS

Para APIs backend robustas:

```bash
npm install -g @nestjs/cli
nest new mi-api-nestjs
cd mi-api-nestjs
npm run start:dev
```

---

## 📝 Estructura Recomendada para Proyecto Mediano

```
mi-proyecto/
├── src/
│   ├── controllers/     # Controladores (si es API)
│   ├── services/        # Lógica de negocio
│   ├── models/          # Interfaces y tipos
│   ├── utils/           # Utilidades
│   ├── config/          # Configuración
│   ├── types/           # Type definitions globales
│   └── index.ts         # Entry point
├── tests/
│   ├── unit/
│   └── integration/
├── dist/                # Output compilado
├── node_modules/
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔍 Verificar que Todo Funciona

### Test rápido

Crear `src/test.ts`:

```typescript
// Tipos primitivos
const name: string = "TypeScript";
const version: number = 5.0;
const isAwesome: boolean = true;

// Interfaces
interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
}

// Función tipada
function calculateTotal(products: Product[]): number {
  return products.reduce((sum, product) => sum + product.price, 0);
}

// Uso
const products: Product[] = [
  { id: 1, name: "Laptop", price: 999, inStock: true },
  { id: 2, name: "Mouse", price: 25, inStock: true },
  { id: 3, name: "Keyboard", price: 75, inStock: false },
];

const total = calculateTotal(products);
console.log(`Total: $${total}`); // Total: $1099

// Generics
function getFirstItem<T>(items: T[]): T | undefined {
  return items[0];
}

const firstProduct = getFirstItem(products);
console.log(firstProduct?.name); // "Laptop"

// Async/Await
async function fetchData(url: string): Promise<any> {
  const response = await fetch(url);
  return response.json();
}

console.log("✅ TypeScript está funcionando correctamente!");
```

Compilar y ejecutar:

```bash
npx tsc src/test.ts --outDir dist
node dist/test.js
```

---

## 🚨 Problemas Comunes

### Error: Cannot find module

**Problema:** TypeScript no encuentra módulos de Node.js

**Solución:**
```bash
npm install --save-dev @types/node
```

### Error: Cannot use import statement outside a module

**Problema:** Usando ESM en proyecto CommonJS

**Solución 1:** Usar CommonJS (require/module.exports)

**Solución 2:** Cambiar a ESM:
- En `package.json`: `"type": "module"`
- En `tsconfig.json`: `"module": "ESNext"`

### Error: tsc: command not found

**Problema:** TypeScript no instalado globalmente

**Solución:**
```bash
npx tsc --version  # Usar npx
# O instalar globalmente
npm install -g typescript
```

---

## 📚 Próximos Pasos

1. ✅ Proyecto configurado
2. 📖 Aprender tipos básicos (Lección 02)
3. 🎯 Practicar con ejemplos
4. 🏗️ Construir proyecto real
5. 🚀 Deploy a producción

---

## 🎯 Recursos Útiles

- **Documentación oficial:** [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)
- **TypeScript Playground:** [https://www.typescriptlang.org/play](https://www.typescriptlang.org/play)
- **DefinitelyTyped:** [https://github.com/DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)
- **TSConfig Reference:** [https://www.typescriptlang.org/tsconfig](https://www.typescriptlang.org/tsconfig)

---

## ✨ Tips Finales

1. **Strict mode:** Siempre usa `"strict": true` en proyectos nuevos
2. **Source maps:** Mantén `"sourceMap": true` para debugging
3. **Watch mode:** Usa `tsc --watch` durante desarrollo
4. **Git:** Agrega `node_modules/` y `dist/` a `.gitignore`
5. **VSCode:** Instala la extensión "ESLint" y "Prettier"

---

¡Felicidades! 🎉 Ya tienes tu primer proyecto TypeScript funcionando.
