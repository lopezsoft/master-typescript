# 🎯 MASTER DE TYPESCRIPT - Repositorio Oficial

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)
![NestJS](https://img.shields.io/badge/NestJS-10.0+-red?logo=nestjs)
![License](https://img.shields.io/badge/license-MIT-green)
![Examples](https://img.shields.io/badge/ejemplos-40+-orange)
![Challenges](https://img.shields.io/badge/retos-8-purple)

**Guía de Arquitectura, Patrones y Escalabilidad para Desarrolladores Modernos**

[🌐 Sitio Web](https://lewislopez.io) • [📚 Comprar Libro](https://lewislopez.io/courses/master-typescript) • [💬 Comunidad](https://github.com/lopezsoft/master-typescript/discussions)

</div>

---

## 📋 ¿Qué encontrarás aquí?

Este repositorio contiene **todo el código complementario** del libro **MASTER DE TYPESCRIPT · Vol. 1**:

- ✅ **40+ archivos de ejemplos** organizados por lección
- ✅ **8 retos completos** con enunciados y soluciones profesionales
- ✅ **Starter NestJS production-ready** con autenticación, base de datos, Docker
- ✅ **~36,000 líneas de código** TypeScript production-ready
- ✅ **Configuración VSCode** profesional con snippets
- ✅ **Tests automatizados** (unit + E2E)
- ✅ **Docker & Docker Compose** listo para producción

---

## 🚀 Inicio Rápido

### Prerrequisitos

```bash
- Node.js 20+ 
- npm o yarn
- Git
- VSCode (recomendado)
```

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/lopezsoft/master-typescript.git
cd master-typescript

# 2. Explorar los ejemplos
cd ejemplos/leccion-01-por-que-typescript
code .

# 3. O probar el starter NestJS
cd starter-nestjs-api
npm install
cp .env.example .env
docker-compose up -d postgres
npm run start:dev

# Swagger disponible en: http://localhost:3000/api/docs
```

---

## 📚 Contenido del Repositorio

### 1️⃣ Ejemplos por Lección (`/ejemplos`)

Código organizado siguiendo las 9 lecciones del libro:

| Lección | Carpeta | Archivos | Contenido Clave |
|---------|---------|----------|-----------------|
| **01** | `leccion-01-por-que-typescript/` | 4 | JavaScript vs TypeScript, problemas reales, setup inicial |
| **02** | `leccion-02-configuracion-entorno/` | 4 | tsconfig.json, strict mode, anatomía del compilador |
| **03** | `leccion-03-tipos-y-alias/` | 4 | Primitivos, interfaces vs types, modelado de dominio |
| **04** | `leccion-04-funciones/` | 5 | Overloads, callbacks, HOF, funciones genéricas |
| **05** | `leccion-05-clases/` | 5 | Herencia, interfaces, modificadores, polimorfismo |
| **06** | `leccion-06-genericos/` | 4 | Genéricos avanzados, constraints, Result<T,E> |
| **07** | `leccion-07-utility-types/` | 4 | Partial, Pick, Record, keyof, mapped types |
| **08** | `leccion-08-type-guards/` | 5 | Narrowing, type guards, uniones discriminadas |
| **09** | `leccion-09-asincronia/` | 5 | Promises, async/await, race, allSettled, patterns |

**Total:** 40+ archivos con ~30,000 líneas de código

### 2️⃣ Retos Prácticos (`/retos`)

8 retos progresivos con enunciado y solución completa:

| # | Reto | Dificultad | Conceptos |
|---|------|------------|-----------|
| 1 | **Task Manager** | ⭐⭐ | Primera app TS, types, interfaces |
| 2 | **E-Commerce Domain** | ⭐⭐⭐ | Modelado de dominio avanzado |
| 3 | **Functional Pipelines** | ⭐⭐⭐ | Composición funcional, tipos |
| 4 | **RPG Combat System** | ⭐⭐⭐⭐ | POO, herencia, polimorfismo |
| 5 | **Generic Repository + Cache** | ⭐⭐⭐ | Genéricos avanzados |
| 6 | **Type-Safe Validation** | ⭐⭐⭐⭐ | Utility types, branded types |
| 7 | **Advanced API Client** | ⭐⭐⭐⭐ | Async patterns, retry, circuit breaker |
| 8 | **Full-Stack Blog** | ⭐⭐⭐⭐⭐ | Integración completa de conceptos |

**Total:** 16 archivos con ~6,200 líneas de código

### 3️⃣ Starter NestJS Production-Ready (`/starter-nestjs-api`)

Template profesional de NestJS + TypeScript con:

#### 🔐 Autenticación Completa
- JWT (Access + Refresh Tokens)
- Registro, Login, Logout
- Guards: JwtAuthGuard, RolesGuard
- Bcrypt password hashing

#### 🗄️ Base de Datos
- TypeORM + PostgreSQL
- Entities y Repositorios
- Pool de conexiones
- Migraciones

#### 📝 Logging & Monitoreo
- Winston Logger profesional
- Health checks (Kubernetes ready)
- Structured logging
- Error tracking

#### 🧪 Testing
- Jest configurado
- Tests E2E completos
- Coverage reports

#### 🐳 DevOps
- Dockerfile multi-stage
- Docker Compose
- Variables de entorno
- Security headers

#### 📚 Documentación
- Swagger/OpenAPI automático
- README completo
- DTOs documentados

**Total:** 45+ archivos con ~6,000 líneas de código

### 4️⃣ Configuración VSCode (`/vscode`)

- ✅ **settings.json** - Configuración optimizada para TypeScript
- ✅ **extensions.json** - Extensiones recomendadas
- ✅ **typescript.code-snippets** - Snippets productivos

---

## 🎓 Estructura de Aprendizaje

### Nivel 1: Fundamentos (Lecciones 1-3)
```
01. ¿Por qué TypeScript? → Motivación y setup
02. Configuración Pro → tsconfig y tooling
03. Tipos y Modelado → Fundamentos sólidos
```

### Nivel 2: Intermedio (Lecciones 4-6)
```
04. Funciones Tipadas → Código funcional
05. Clases y POO → Diseño orientado a objetos
06. Genéricos → Código reutilizable
```

### Nivel 3: Avanzado (Lecciones 7-9)
```
07. Utility Types → Transformaciones de tipos
08. Type Guards → Type safety extremo
09. Asincronía → Patrones async avanzados
```

---

## 💻 Cómo Usar Este Repositorio

### Opción 1: Seguir el Libro
```bash
# Lee el capítulo en el libro
# Luego revisa el código correspondiente
cd ejemplos/leccion-XX-nombre/
code .
```

### Opción 2: Explorar por Tema
```bash
# ¿Quieres aprender genéricos?
cd ejemplos/leccion-06-genericos/

# ¿Quieres practicar async?
cd ejemplos/leccion-09-asincronia/
```

### Opción 3: Resolver Retos
```bash
# 1. Lee el enunciado
cd retos/leccion-XX-nombre/
cat reto-nombre.enunciado.ts

# 2. Intenta resolverlo

# 3. Compara con la solución
cat reto-nombre.solucion.ts
```

### Opción 4: Iniciar Proyecto Real
```bash
# Usa el starter para tu proyecto
cd starter-nestjs-api/
npm install
# Sigue el README del starter
```

---

## 🛠️ Scripts Útiles

```bash
# En cualquier carpeta de ejemplos
tsc --noEmit          # Verificar tipos sin compilar
tsc && node dist/...  # Compilar y ejecutar

# En el starter NestJS
npm run start:dev     # Modo desarrollo
npm run test          # Ejecutar tests
npm run test:e2e      # Tests E2E
npm run build         # Build de producción
```

---

## 📖 Recursos Adicionales

### Documentación Oficial
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [NestJS Docs](https://docs.nestjs.com/)
- [TypeORM Docs](https://typeorm.io/)

### Comunidad
- [GitHub Discussions](https://github.com/lopezsoft/master-typescript/discussions)
- [Issues](https://github.com/lopezsoft/master-typescript/issues)

### Contenido Relacionado
- 🌐 [Blog Lewis Lopez](https://lewislopez.io)
- 📚 [Más Cursos](https://lewislopez.io/courses)

---

## 🤝 Contribuciones

¿Encontraste un error? ¿Tienes una mejora? ¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit tus cambios (`git commit -m 'Agregar mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

Lee [CONTRIBUTING.md](CONTRIBUTING.md) para más detalles.

---

## 📊 Estadísticas del Proyecto

```
📁 Archivos totales:    80+
💻 Líneas de código:    36,000+
📚 Lecciones:           9
🎯 Retos:               8
⚙️  Configuraciones:    4
🧪 Tests:               20+
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Lewis Oswaldo López Gómez**
- Website: [lewislopez.io](https://lewislopez.io)
- GitHub: [@lopezsoft](https://github.com/lopezsoft)
- Twitter: [@lewis_lopezdev](https://twitter.com/lewis_lopezdev)

---

## ⭐ Apóyanos

Si este repositorio te ha sido útil:

1. ⭐ Dale una estrella al repo
2. 📚 [Compra el libro completo](https://lewislopez.io/courses/master-typescript)
3. 🔄 Compártelo con otros desarrolladores
4. 💬 Únete a las [Discussions](https://github.com/lopezsoft/master-typescript/discussions)

---

<div align="center">

**¿Listo para dominar TypeScript?**

[🚀 Empezar Ahora](./ejemplos/leccion-01-por-que-typescript/) • [📚 Ver Retos](./retos/) • [🏗️ Starter NestJS](./starter-nestjs-api/)

</div>
