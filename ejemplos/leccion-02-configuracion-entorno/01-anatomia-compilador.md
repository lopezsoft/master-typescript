# Anatomía del Compilador TypeScript

Esta guía explica las opciones más importantes del compilador de TypeScript (`tsc`) y cómo configurarlas en `tsconfig.json`.

---

## 📋 Estructura del tsconfig.json

```json
{
  "compilerOptions": {
    // Opciones del compilador
  },
  "include": [],      // Archivos a incluir
  "exclude": [],      // Archivos a excluir
  "extends": "",      // Heredar configuración
  "files": []         // Archivos específicos
}
```

---

## 🎯 Opciones del Compilador por Categoría

### 1. **Opciones de Salida (Output)**

#### `target` - Versión de JavaScript de salida
```json
{
  "target": "ES2020"  // ES3, ES5, ES2015, ES2016, ES2017, ES2018, ES2019, ES2020, ES2021, ES2022, ESNext
}
```
**Recomendación:** `ES2020` o superior para Node.js moderno, `ES2015` para navegadores antiguos.

#### `module` - Sistema de módulos
```json
{
  "module": "commonjs"  // commonjs, amd, umd, system, es2015, es2020, esnext, node16, nodenext
}
```
**Recomendación:** 
- `commonjs` para Node.js con CommonJS
- `esnext` para ES Modules modernos
- `nodenext` para Node.js con soporte híbrido

#### `outDir` - Carpeta de salida
```json
{
  "outDir": "./dist"
}
```
Dónde se generan los archivos `.js` compilados.

#### `rootDir` - Carpeta raíz
```json
{
  "rootDir": "./src"
}
```
Preserva la estructura de carpetas desde esta raíz.

#### `outFile` - Concatenar en un solo archivo
```json
{
  "outFile": "./dist/bundle.js"
}
```
⚠️ Solo funciona con `module: "amd"` o `"system"`

---

### 2. **Strict Checks (Verificaciones Estrictas)**

#### `strict` - Activa TODAS las verificaciones estrictas
```json
{
  "strict": true  // Equivale a activar todas las opciones strict* a la vez
}
```

Esto activa:
- `noImplicitAny`
- `noImplicitThis`
- `alwaysStrict`
- `strictNullChecks`
- `strictFunctionTypes`
- `strictBindCallApply`
- `strictPropertyInitialization`

#### `noImplicitAny` - Error si se infiere `any`
```json
{
  "noImplicitAny": true
}
```

```typescript
// ❌ Error con noImplicitAny: true
function add(a, b) {  // Parameter 'a' implicitly has an 'any' type
  return a + b;
}

// ✅ Correcto
function add(a: number, b: number) {
  return a + b;
}
```

#### `strictNullChecks` - `null` y `undefined` son tipos distintos
```json
{
  "strictNullChecks": true
}
```

```typescript
// ❌ Error con strictNullChecks: true
let name: string = null;  // Type 'null' is not assignable to type 'string'

// ✅ Correcto
let name: string | null = null;
```

---

### 3. **Verificaciones Adicionales (Linting)**

#### `noUnusedLocals` - Error en variables no usadas
```json
{
  "noUnusedLocals": true
}
```

```typescript
function calculate() {
  const unused = 10;  // ❌ Error: 'unused' is declared but its value is never read
  return 5;
}
```

#### `noUnusedParameters` - Error en parámetros no usados
```json
{
  "noUnusedParameters": true
}
```

```typescript
function greet(name: string, age: number) {  // ❌ Error: 'age' is declared but never used
  return `Hello, ${name}`;
}
```

#### `noImplicitReturns` - Todas las rutas deben retornar
```json
{
  "noImplicitReturns": true
}
```

```typescript
// ❌ Error: Not all code paths return a value
function getDiscount(amount: number): number {
  if (amount > 100) {
    return 10;
  }
  // Falta return aquí
}

// ✅ Correcto
function getDiscount(amount: number): number {
  if (amount > 100) {
    return 10;
  }
  return 0;
}
```

#### `noFallthroughCasesInSwitch` - Prevenir fall-through en switch
```json
{
  "noFallthroughCasesInSwitch": true
}
```

```typescript
// ❌ Error: Fallthrough case in switch
switch (status) {
  case "pending":
    console.log("Pending");
  case "done":  // Error: falta break
    console.log("Done");
}

// ✅ Correcto
switch (status) {
  case "pending":
    console.log("Pending");
    break;
  case "done":
    console.log("Done");
    break;
}
```

---

### 4. **Decoradores y Metadata**

#### `experimentalDecorators` - Habilita decoradores
```json
{
  "experimentalDecorators": true
}
```
Requerido para usar `@decorador` en clases, métodos, etc. (NestJS, TypeORM).

#### `emitDecoratorMetadata` - Emite metadata en runtime
```json
{
  "emitDecoratorMetadata": true
}
```
Necesario para inyección de dependencias (NestJS).

---

### 5. **Resolución de Módulos**

#### `baseUrl` - URL base para imports
```json
{
  "baseUrl": "./src"
}
```

```typescript
// Con baseUrl: "./src"
import { UserService } from "services/user.service";  // En vez de "../../../services/user.service"
```

#### `paths` - Alias de rutas
```json
{
  "baseUrl": "./",
  "paths": {
    "@app/*": ["src/app/*"],
    "@shared/*": ["src/shared/*"],
    "@config/*": ["src/config/*"]
  }
}
```

```typescript
// Ahora puedes hacer:
import { AppModule } from "@app/app.module";
import { Logger } from "@shared/logger";
```

#### `moduleResolution` - Estrategia de resolución
```json
{
  "moduleResolution": "node"  // node, classic, node16, nodenext
}
```
**Recomendación:** `node` para la mayoría de proyectos.

---

### 6. **Source Maps y Debug**

#### `sourceMap` - Generar archivos .map
```json
{
  "sourceMap": true
}
```
Permite debuggear el código TypeScript original en el navegador/Node.js.

#### `inlineSourceMap` - Source maps inline
```json
{
  "inlineSourceMap": true
}
```
Incluye el source map dentro del archivo .js (aumenta el tamaño).

#### `declaration` - Generar archivos .d.ts
```json
{
  "declaration": true
}
```
Genera archivos de definición de tipos para librerías.

---

### 7. **Interoperabilidad con JavaScript**

#### `allowJs` - Permitir archivos .js
```json
{
  "allowJs": true
}
```
Útil para migración gradual de JS a TS.

#### `checkJs` - Verificar tipos en archivos .js
```json
{
  "checkJs": true,
  "allowJs": true
}
```
TypeScript verifica tipos en archivos `.js` usando JSDoc.

#### `esModuleInterop` - Mejor interop con CommonJS
```json
{
  "esModuleInterop": true
}
```

```typescript
// Sin esModuleInterop
import * as express from "express";

// Con esModuleInterop
import express from "express";  // ✅ Más limpio
```

---

### 8. **Performance**

#### `incremental` - Compilación incremental
```json
{
  "incremental": true
}
```
Guarda información para compilaciones más rápidas.

#### `skipLibCheck` - No verificar archivos .d.ts
```json
{
  "skipLibCheck": true
}
```
Acelera la compilación ignorando errores en node_modules.

---

## 🔧 Ejemplo de tsconfig.json Profesional

### Para aplicación Node.js/NestJS:

```json
{
  "compilerOptions": {
    // Output
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    
    // Strict Type Checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    
    // Module Resolution
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "@app/*": ["src/*"],
      "@config/*": ["src/config/*"]
    },
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    
    // Decorators (NestJS)
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    
    // Source Maps & Declarations
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    
    // Performance
    "incremental": true,
    "skipLibCheck": true,
    
    // Other
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

---

## 📚 Comandos del Compilador

```bash
# Compilar proyecto
tsc

# Compilar en modo watch
tsc --watch

# Compilar sin emitir archivos (solo verificar)
tsc --noEmit

# Compilar archivo específico
tsc archivo.ts

# Crear tsconfig.json
tsc --init

# Ver ayuda
tsc --help
```

---

## 🎯 Mejores Prácticas

1. ✅ **Siempre usa `strict: true`** en proyectos nuevos
2. ✅ **Activa `noUnusedLocals` y `noUnusedParameters`** para código limpio
3. ✅ **Usa `skipLibCheck: true`** para acelerar compilación
4. ✅ **Configura `paths`** para imports más limpios
5. ✅ **Activa `sourceMap`** para debugging
6. ✅ **Usa `incremental`** en proyectos grandes

---

## 🔗 Referencias

- [Documentación oficial de tsconfig](https://www.typescriptlang.org/tsconfig)
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig)
- [Compiler Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
