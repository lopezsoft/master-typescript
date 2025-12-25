# ===============================================
# DOCKERFILE - MULTI-STAGE BUILD
# Starter production-ready NestJS + TypeScript
# ===============================================

# -----------------------------------------------
# ETAPA 1: Build
# -----------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar todas las dependencias (incluidas dev)
RUN npm ci

# Copiar código fuente
COPY src ./src

# Compilar TypeScript
RUN npm run build

# -----------------------------------------------
# ETAPA 2: Production
# -----------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

# Copiar solo archivos necesarios para producción
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código compilado desde builder
COPY --from=builder /app/dist ./dist

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Cambiar ownership de archivos
RUN chown -R nestjs:nodejs /app

# Cambiar a usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "dist/main.js"]
