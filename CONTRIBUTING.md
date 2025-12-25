# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a MASTER DE TYPESCRIPT! Este documento te guiará en el proceso.

---

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Proceso de Contribución](#proceso-de-contribución)
- [Guías de Estilo](#guías-de-estilo)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)

---

## 📜 Código de Conducta

Este proyecto adhiere a un [Código de Conducta](CODE_OF_CONDUCT.md). Al participar, se espera que lo respetes.

---

## 🎯 ¿Cómo Puedo Contribuir?

### 1. Reportar Bugs
- Usa la plantilla de Issues
- Describe el problema claramente
- Incluye pasos para reproducirlo
- Indica tu entorno (OS, Node version, etc.)

### 2. Sugerir Mejoras
- Usa GitHub Discussions
- Explica el caso de uso
- Proporciona ejemplos si es posible

### 3. Mejorar Documentación
- Corregir typos
- Clarificar explicaciones
- Agregar ejemplos
- Traducir contenido

### 4. Contribuir Código
- Arreglar bugs
- Agregar nuevos ejemplos
- Mejorar ejemplos existentes
- Agregar tests

---

## ⚙️ Configuración del Entorno

### Requisitos

- Node.js 20+
- npm 9+
- Git
- VSCode (recomendado)

### Pasos

```bash
# 1. Fork el repositorio en GitHub

# 2. Clonar tu fork
git clone https://github.com/TU_USUARIO/master-typescript.git
cd master-typescript

# 3. Agregar remote upstream
git remote add upstream https://github.com/lopezsoft/master-typescript.git

# 4. Crear una rama para tu cambio
git checkout -b feature/mi-contribucion

# 5. Instalar dependencias (si es necesario)
cd starter-nestjs-api
npm install
```

---

## 🔄 Proceso de Contribución

### 1. Antes de Empezar

- Revisa los Issues abiertos
- Comenta en el Issue que lo vas a trabajar
- Si no hay Issue, créalo primero

### 2. Desarrollo

```bash
# Asegúrate de estar en tu rama
git checkout feature/mi-contribucion

# Realiza tus cambios

# Commit frecuente con mensajes descriptivos
git add .
git commit -m "feat: agregar ejemplo de mapped types"
```

### 3. Mantener tu Rama Actualizada

```bash
# Obtener últimos cambios del upstream
git fetch upstream
git rebase upstream/main
```

### 4. Testing

Antes de hacer push:

```bash
# Verificar que el código compila
tsc --noEmit

# Si modificaste el starter NestJS
cd starter-nestjs-api
npm run test
npm run test:e2e
npm run lint
```

### 5. Push y Pull Request

```bash
# Push a tu fork
git push origin feature/mi-contribucion

# Luego en GitHub:
# 1. Ve a tu fork
# 2. Haz clic en "Compare & pull request"
# 3. Llena la plantilla del PR
# 4. Espera el review
```

---

## 📝 Guías de Estilo

### TypeScript

#### Código

```typescript
// ✅ BUENO
interface User {
  id: string;
  email: string;
  name: string;
}

function createUser(data: Partial<User>): User {
  return {
    id: generateId(),
    email: data.email ?? '',
    name: data.name ?? 'Anonymous',
  };
}

// ❌ MALO
interface user {
  ID: string;
  Email: string;
}

function CreateUser(data: any) {
  return { ...data };
}
```

#### Nombres

- **Interfaces/Types:** PascalCase (`UserProfile`, `ApiResponse`)
- **Functions:** camelCase (`createUser`, `fetchData`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_URL`)
- **Variables:** camelCase (`userName`, `isValid`)

#### Comentarios

```typescript
/**
 * Crea un nuevo usuario en el sistema
 * 
 * @param data - Datos parciales del usuario
 * @returns Usuario completo con ID generado
 * @throws {ValidationError} Si el email es inválido
 * 
 * @example
 * ```ts
 * const user = createUser({ email: 'test@example.com' });
 * ```
 */
function createUser(data: Partial<User>): User {
  // Implementación...
}
```

### Archivos de Ejemplo

#### Estructura

```typescript
/**
 * ===============================================
 * TÍTULO DEL EJEMPLO
 * Descripción breve del concepto que enseña
 * ===============================================
 */

// 1. IMPORTS (si es necesario)
import { ... } from '...';

// 2. TYPES/INTERFACES
interface Example {
  // ...
}

// 3. IMPLEMENTACIÓN
// Código explicativo con comentarios

// 4. TESTS/EJEMPLOS DE USO
console.log('=== Ejemplos de uso ===');
// Casos de prueba
```

#### Ejemplo Completo

```typescript
/**
 * ===============================================
 * MAPPED TYPES AVANZADOS
 * Transformación de tipos existentes
 * ===============================================
 */

// Tipo base
interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
}

// Mapped type: hacer todo opcional
type PartialProduct = {
  [K in keyof Product]?: Product[K];
};

// Mapped type: hacer todo readonly
type ReadonlyProduct = {
  readonly [K in keyof Product]: Product[K];
};

// === Ejemplos de uso ===
const partial: PartialProduct = { name: 'Laptop' };
const readonly: ReadonlyProduct = {
  id: 1,
  name: 'Phone',
  price: 999,
  inStock: true,
};

// readonly.price = 1200; // Error: readonly
console.log('✅ Mapped types funcionando correctamente');
```

### Git Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Nuevas características
git commit -m "feat: agregar ejemplo de utility types"

# Correcciones de bugs
git commit -m "fix: corregir error en validación"

# Documentación
git commit -m "docs: actualizar README con nuevos ejemplos"

# Refactoring
git commit -m "refactor: mejorar estructura de carpetas"

# Tests
git commit -m "test: agregar tests E2E para auth"

# Cambios de estilo/formato
git commit -m "style: formatear código con prettier"
```

---

## 🐛 Reportar Bugs

### Antes de Reportar

1. Busca en Issues si ya fue reportado
2. Verifica que estés usando la última versión
3. Intenta reproducir en un entorno limpio

### Información a Incluir

```markdown
**Descripción del Bug:**
[Descripción clara y concisa]

**Pasos para Reproducir:**
1. Ir a '...'
2. Ejecutar '....'
3. Ver error

**Comportamiento Esperado:**
[Qué debería pasar]

**Comportamiento Actual:**
[Qué pasa realmente]

**Ambiente:**
- OS: [ej. Windows 11]
- Node: [ej. 20.10.0]
- npm: [ej. 10.2.0]
- Navegador: [si aplica]

**Logs/Screenshots:**
[Si tienes]

**Código Relevante:**
```typescript
// Tu código aquí
```
```

---

## 💡 Sugerir Mejoras

### Para Nuevos Ejemplos

```markdown
**Ejemplo Propuesto:**
[Nombre del ejemplo]

**Lección:**
[A qué lección pertenece: 01-09]

**Concepto que Enseña:**
[Qué aprenderá el estudiante]

**Por Qué es Útil:**
[Justificación]

**Ejemplo de Código (opcional):**
```typescript
// Tu propuesta
```
```

### Para Nuevos Retos

```markdown
**Reto Propuesto:**
[Nombre del reto]

**Dificultad:**
[⭐⭐⭐⭐⭐]

**Conceptos que Practica:**
- Concepto 1
- Concepto 2

**Descripción:**
[Qué debe construir el estudiante]

**Criterios de Aceptación:**
- [ ] Criterio 1
- [ ] Criterio 2
```

---

## ✅ Checklist antes del PR

Antes de crear un Pull Request, verifica:

- [ ] El código compila sin errores (`tsc --noEmit`)
- [ ] Sigue las guías de estilo
- [ ] Los tests pasan (si aplica)
- [ ] La documentación está actualizada
- [ ] Los commits siguen Conventional Commits
- [ ] El código tiene comentarios explicativos
- [ ] Agregaste ejemplos de uso (si aplica)
- [ ] Probaste en un entorno limpio

---

## 🎯 Tipos de Contribuciones Bienvenidas

### 🟢 Fácil (Buenos para Empezar)

- Corregir typos en documentación
- Mejorar comentarios en código
- Agregar ejemplos de uso
- Traducir contenido

### 🟡 Medio

- Agregar nuevos ejemplos a lecciones existentes
- Mejorar ejemplos existentes
- Agregar tests
- Mejorar configuración

### 🔴 Avanzado

- Crear nuevos retos completos
- Agregar features al starter NestJS
- Refactorizar arquitectura
- Optimizaciones de performance

---

## 📧 Contacto

¿Tienes preguntas sobre cómo contribuir?

- 💬 [GitHub Discussions](https://github.com/lopezsoft/master-typescript/discussions)
- 📧 Email: [contacto@lewislopez.io](mailto:contacto@lewislopez.io)
- 🐛 [Issues](https://github.com/lopezsoft/master-typescript/issues)

---

## 🙏 Reconocimientos

Todos los contribuidores serán reconocidos en el README principal.

---

<div align="center">

**¡Gracias por contribuir a la comunidad TypeScript!**

[⬅️ Volver al README](../README.md)

</div>
