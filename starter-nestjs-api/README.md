# 🚀 Starter NestJS Production-Ready

**Versión 2.0** - Starter profesional de NestJS + TypeScript para el curso **MASTER DE TYPESCRIPT · Vol. 1**

## 📋 Características

### ✅ Funcionalidades Implementadas

- **🔐 Autenticación Completa**
  - JWT (Access + Refresh Tokens)
  - Registro y Login
  - Guards (JWT, Roles)
  - Password hashing con bcrypt

- **🗄️ Base de Datos**
  - TypeORM con PostgreSQL
  - Entities y Repositorios
  - Migraciones preparadas
  - Pool de conexiones configurado

- **📝 Logging Profesional**
  - Winston Logger
  - Rotación de archivos
  - Diferentes niveles (error, warn, info, debug)
  - Logs estructurados

- **🛡️ Seguridad**
  - Helmet (security headers)
  - CORS configurado
  - Rate limiting ready
  - Validación de DTOs

- **📊 Monitoreo**
  - Health checks
  - Terminus integration
  - Liveness & Readiness probes (Kubernetes ready)

- **📚 Documentación**
  - Swagger/OpenAPI automático
  - DTOs documentados
  - Ejemplos de requests/responses

- **🧪 Testing**
  - Jest configurado
  - Tests unitarios
  - Tests E2E
  - Coverage reports

- **🐳 DevOps**
  - Dockerfile multi-stage
  - Docker Compose
  - Variables de entorno
  - Healthchecks

## 🏗️ Estructura del Proyecto

```
starter-nestjs-api/
├── src/
│   ├── common/              # Código compartido
│   │   ├── decorators/      # Decorators personalizados
│   │   ├── dto/             # DTOs comunes (pagination, etc.)
│   │   └── pipes/           # Pipes de validación
│   ├── core/                # Módulos core
│   │   ├── config/          # Configuración centralizada
│   │   ├── database/        # Configuración de TypeORM
│   │   ├── filters/         # Exception filters
│   │   ├── health/          # Health checks
│   │   ├── interceptors/    # Interceptors globales
│   │   └── logger/          # Winston logger
│   ├── modules/             # Módulos de features
│   │   └── auth/            # Módulo de autenticación
│   │       ├── dto/         # DTOs de auth
│   │       ├── entities/    # Entidades (User)
│   │       ├── guards/      # Guards (JWT, Roles)
│   │       ├── strategies/  # Passport strategies
│   │       ├── auth.controller.ts
│   │       ├── auth.service.ts
│   │       └── auth.module.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/                    # Tests E2E
├── .env.example             # Variables de entorno ejemplo
├── .eslintrc.js             # Configuración ESLint
├── .gitignore
├── .prettierrc              # Configuración Prettier
├── docker-compose.yml       # Docker Compose
├── Dockerfile               # Multi-stage build
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Inicio Rápido

### 1. Clonar o descargar el proyecto

```bash
cd starter-nestjs-api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores
# Importante: Cambiar JWT_SECRET en producción!
```

### 4. Iniciar base de datos con Docker

```bash
docker-compose up -d postgres
```

### 5. Ejecutar migraciones (opcional, synchronize=true en dev)

```bash
npm run migration:run
```

### 6. Iniciar la aplicación

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

### 7. Acceder a la aplicación

- **API:** http://localhost:3000/api/v1
- **Swagger:** http://localhost:3000/api/docs
- **Health:** http://localhost:3000/api/v1/health

## 📦 Comandos NPM

```bash
# Desarrollo
npm run start:dev          # Modo watch
npm run start:debug        # Con debugger

# Build
npm run build              # Compilar TypeScript

# Testing
npm run test               # Tests unitarios
npm run test:watch         # Tests en modo watch
npm run test:cov           # Coverage
npm run test:e2e           # Tests E2E

# Linting
npm run lint               # ESLint
npm run format             # Prettier

# Producción
npm run start:prod         # Iniciar en producción
```

## 🐳 Docker

### Desarrollo con Docker Compose

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Detener
docker-compose down
```

### Build de imagen Docker

```bash
# Build
docker build -t master-ts-api .

# Run
docker run -p 3000:3000 master-ts-api
```

## 🔐 Autenticación

### Flujo de autenticación

```typescript
// 1. Registro
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}

// 2. Login
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "Password123!"
}

// Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}

// 3. Acceder a rutas protegidas
GET /api/v1/auth/profile
Headers: { "Authorization": "Bearer eyJhbGc..." }

// 4. Refresh tokens
POST /api/v1/auth/refresh
{
  "refreshToken": "eyJhbGc..."
}
```

### Proteger rutas

```typescript
// Ruta pública
@Public()
@Get('public')
publicRoute() { ... }

// Ruta protegida (requiere autenticación)
@Get('protected')
@UseGuards(JwtAuthGuard)
protectedRoute() { ... }

// Solo administradores
@Get('admin')
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
adminRoute() { ... }
```

## 📊 Base de Datos

### Conexión

La conexión se configura en `src/core/database/database.module.ts` usando variables de entorno.

### Crear una nueva entidad

```typescript
// src/modules/posts/entities/post.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;
}
```

### Usar en un módulo

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([PostEntity])],
  // ...
})
export class PostsModule {}
```

## 📝 Validación

### Crear DTOs

```typescript
import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
```

La validación se aplica automáticamente gracias al `ValidationPipe` global.

## 📚 Swagger

Swagger se genera automáticamente basándose en:
- Decorators `@Api*()` en controllers
- DTOs con decorators de `class-validator`
- Respuestas tipadas

Acceder en: http://localhost:3000/api/docs

## 🧪 Testing

### Test unitario ejemplo

```typescript
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Test E2E ejemplo

```typescript
describe('/auth/login (POST)', () => {
  it('should login successfully', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@test.com', password: 'password' })
      .expect(200);
  });
});
```

## 🔧 Configuración

### Variables de entorno importantes

```bash
# Aplicación
NODE_ENV=development
PORT=3000

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=master_typescript_db

# JWT
JWT_SECRET=change-this-secret
JWT_EXPIRATION=1d

# Swagger
SWAGGER_ENABLED=true
SWAGGER_PATH=api/docs
```

## 📖 Patrones y Mejores Prácticas

### 1. Organización modular
- Cada feature en su módulo
- Separación de concerns (controller, service, repository)

### 2. DTOs para todo
- Input: DTOs con validación
- Output: DTOs sin datos sensibles
- Use `@Exclude()` en entities para passwords

### 3. Manejo de errores
- Exception filters globales
- Respuestas estandarizadas
- Logging de errores

### 4. Seguridad
- No exponer stack traces en producción
- Validar todos los inputs
- Rate limiting
- CORS configurado

### 5. Testing
- Tests para lógica de negocio
- E2E para flujos críticos
- Mocks para dependencias externas

## 🚢 Deploy en Producción

### Checklist antes de deploy

- [ ] Cambiar `JWT_SECRET` y `JWT_REFRESH_SECRET`
- [ ] Configurar `DB_SYNCHRONIZE=false`
- [ ] Usar migraciones para cambios de BD
- [ ] Configurar `NODE_ENV=production`
- [ ] Habilitar logging a archivos
- [ ] Configurar CORS con dominios específicos
- [ ] Revisar límites de rate limiting
- [ ] Deshabilitar Swagger en producción (opcional)
- [ ] Configurar SSL/TLS
- [ ] Configurar health checks en orquestador

### Deploy con Docker

```bash
# Build
docker build -t master-ts-api:latest .

# Run
docker run -d \
  -p 3000:3000 \
  --env-file .env.production \
  --name master-ts-api \
  master-ts-api:latest
```

### Deploy en Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: master-ts-api
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: master-ts-api:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /api/v1/health/live
            port: 3000
        readinessProbe:
          httpGet:
            path: /api/v1/health/ready
            port: 3000
```

## 🤝 Contribuir

Este es un starter educativo. Siéntete libre de:
- Agregar nuevos módulos
- Mejorar la configuración
- Agregar más tests
- Documentar mejor

## 📄 Licencia

MIT

## 👨‍💻 Autor

**Lopez Software**
- Curso: MASTER DE TYPESCRIPT · Vol. 1
- GitHub: [lopezsoft/master-typescript](https://github.com/lopezsoft/master-typescript)

---

**¿Preguntas?** Revisa la documentación de:
- [NestJS](https://docs.nestjs.com)
- [TypeORM](https://typeorm.io)
- [TypeScript](https://www.typescriptlang.org)
