# 📘 { MASTER DE TYPESCRIPT } - Código Fuente

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red.svg)](https://nestjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Este repositorio contiene los ejemplos prácticos y ejercicios del ebook **{ MASTER DE TYPESCRIPT }: Guía de Arquitectura y Patrones Enterprise**.

📘 **¿Aún no tienes el ebook?**  
Aprende a diseñar sistemas escalables, no solo a escribir código.  
👉 [Consigue la Guía Completa Aquí](https://lewislopez.io/courses/master-typescript/)

---

## 📊 Estado del Proyecto

> **Nota importante:** Este proyecto está en desarrollo activo. Ver [ANALISIS-PROYECTO.md](docs/ANALISIS-PROYECTO.md) para el análisis detallado del estado actual.

**Progreso actual:**
- ✅ Lección 07 (Utility Types) - **100% completa**
- ⚠️ Lecciones 04, 05, 08 - **75% completas**
- ⚠️ Otras lecciones - **En desarrollo**

---

## 📚 Contenido del repositorio

### 1. 📁 Ejemplos por lección (`/ejemplos`)

Cada lección incluye ejemplos prácticos con código comentado y ejecutable:

| Lección | Carpeta | Contenido | Estado |
|---------|---------|-----------|--------|
| **01** | `leccion-01-por-que-typescript/` | Por qué TypeScript: problemas de JS vs solución tipada | ⚠️ 50% |
| **02** | `leccion-02-configuracion-entorno/` | Configuración del entorno y tsconfig.json | ⚠️ 25% |
| **03** | `leccion-03-tipos-y-alias/` | Tipos primitivos, alias y modelado de datos | ⚠️ 25% |
| **04** | `leccion-04-funciones/` | Funciones tipadas, overloads, callbacks y HOF | ⚠️ 75% |
| **05** | `leccion-05-clases/` | Clases, herencia, interfaces y clases abstractas | ⚠️ 75% |
| **06** | `leccion-06-genericos/` | Genéricos y el patrón Result<T,E> | ⚠️ 25% |
| **07** | `leccion-07-utility-types/` | Utility Types: Partial, Pick, Record, keyof, mapped types | ✅ 100% |
| **08** | `leccion-08-type-guards/` | Type Guards, narrowing y uniones discriminadas | ⚠️ 75% |
| **09** | `leccion-09-asincronia/` | Asincronía: Promises, async/await, Promise.all | ⚠️ 25% |

### 2. 🎯 Retos con enunciado y solución (`/retos`)

Ejercicios prácticos para validar tu aprendizaje:

- ✅ `leccion-06-cache-generica/` - Sistema de caché genérico con Result pattern
- ⏳ Más retos en desarrollo...

### 3. 🚀 Proyecto base NestJS (`/starter-nestjs-api`)

Plantilla minimalista de NestJS + TypeScript con configuración profesional:

- ✅ TypeScript strict mode activado
- ✅ Estructura básica de NestJS
- ⏳ Mejoras en progreso (ver análisis)

### 4. ⚙️ Configuración recomendada de VSCode (`/vscode`)

- `extensions.json` - Extensiones recomendadas
- `settings.json` - Configuración optimizada
- `typescript.code-snippets` - Snippets útiles para TypeScript

### 5. 📖 Documentación (`/docs`)

- [ANALISIS-PROYECTO.md](docs/ANALISIS-PROYECTO.md) - Análisis completo del estado del proyecto
- Más documentación próximamente...

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **TypeScript** 5.0+ (se instala globalmente o por proyecto)
- **Editor recomendado:** Visual Studio Code

### Opción 1: Explorar ejemplos individuales

```bash
# Clona el repositorio
git clone https://github.com/lopezsoft/master-typescript.git
cd master-typescript

# Navega a una lección
cd ejemplos/leccion-07-utility-types

# Ejecuta con ts-node (instalar si no lo tienes)
npx ts-node 01-partial-required-readonly.ts

# O compila y ejecuta
tsc 01-partial-required-readonly.ts
node 01-partial-required-readonly.js
```

### Opción 2: Usar el Starter de NestJS

```bash
# Navega al starter
cd starter-nestjs-api

# Instala dependencias
npm install

# Ejecuta en modo desarrollo
npm run start:dev

# La API estará en http://localhost:3000
```

### Opción 3: Configurar VSCode (Recomendado)

1. Abre el proyecto en VSCode
2. Acepta instalar las extensiones recomendadas
3. VSCode aplicará automáticamente la configuración optimizada

---

## 📖 Cómo usar este repositorio

### Para estudiantes del ebook

1. **Lee la lección** correspondiente en el ebook
2. **Explora los ejemplos** de esa lección en `/ejemplos`
3. **Practica con los retos** en `/retos`
4. **Experimenta** modificando el código

### Para desarrolladores que quieren aprender

1. Empieza por la **Lección 01** para entender el contexto
2. Sigue el orden de las lecciones (01 → 09)
3. Ejecuta cada ejemplo y modifícalo para experimentar
4. Intenta resolver los retos antes de ver la solución

### Para usar el Starter NestJS

1. Copia la carpeta `starter-nestjs-api` a tu proyecto
2. Renombra y configura según tus necesidades
3. Usa como base para proyectos reales

---

## 🛠️ Scripts útiles

```bash
# Compilar TypeScript (desde cualquier carpeta de ejemplos)
tsc --noEmit  # Solo verifica tipos sin generar archivos

# Ejecutar con ts-node
npx ts-node archivo.ts

# Ejecutar con tsx (más rápido)
npx tsx archivo.ts
```

---

## 📚 Recursos adicionales

- 📖 [Documentación oficial de TypeScript](https://www.typescriptlang.org/docs/)
- 🚀 [Documentación de NestJS](https://docs.nestjs.com/)
- 🎓 [TypeScript Playground](https://www.typescriptlang.org/play) - Experimenta online
- 💬 [Discord de TypeScript](https://discord.gg/typescript)

---

## 🤝 Contribuir

Este repositorio está en constante mejora. Si encuentras errores o tienes sugerencias:

1. Abre un [Issue](https://github.com/lopezsoft/master-typescript/issues)
2. O envía un Pull Request con mejoras

---

## 📄 Licencia

Este código es de uso educativo. Ver [LICENSE](LICENSE) para más detalles.

---

## ✍️ Autor

**Lewis Oswaldo López Gómez**  
Arquitecto de Software & FullStack Developer

- 🌐 Website: [lewislopez.io](https://lewislopez.io)
- 💼 LinkedIn: [lewis-lopez-gomez-architect](https://www.linkedin.com/in/lewis-lopez-gomez-architect)
- 📧 Email: contacto@lewislopez.io

---

## ⭐ ¿Te gusta este proyecto?

Si este contenido te está ayudando:

1. ⭐ Dale una estrella a este repo
2. 📘 [Consigue el ebook completo](https://lewislopez.io/courses/master-typescript/)
3. 🔄 Comparte con otros desarrolladores

---

**© 2025 Lewis Lopez. Todos los derechos reservados.**
