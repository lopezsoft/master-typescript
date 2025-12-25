/**
 * LECCIÓN 03 - TIPOS Y MODELADO
 * Archivo 03: Módulos y Barrels
 *
 * Organización de código con módulos ES6 y patrón barrel exports.
 */

// ============================================
// 1. MÓDULOS EN TYPESCRIPT
// ============================================

/*
TypeScript usa módulos ES6 (import/export)
Cada archivo con export/import es un módulo
Los archivos sin export/import son scripts globales
*/

// ============================================
// 2. EXPORTS NOMBRADOS (NAMED EXPORTS)
// ============================================

// Exportar variables
export const API_URL = "https://api.example.com";
export const MAX_RETRIES = 3;

// Exportar funciones
export function calculateTotal(items: number[]): number {
  return items.reduce((sum, item) => sum + item, 0);
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// Exportar tipos e interfaces
export interface User {
  id: string;
  name: string;
  email: string;
}

export type UserRole = "admin" | "user" | "guest";

// Exportar clases
export class Logger {
  log(message: string) {
    console.log(`[LOG] ${message}`);
  }
}

// ============================================
// 3. EXPORT DEFAULT
// ============================================

// Solo puede haber un default export por archivo
export default class UserService {
  async findById(id: string): Promise<User | null> {
    // implementación
    return null;
  }

  async create(user: Omit<User, "id">): Promise<User> {
    // implementación
    return { id: "1", ...user };
  }
}

// ============================================
// 4. RE-EXPORTS
// ============================================

// Exportar desde otro módulo
// export { User, UserRole } from './types/user';
// export { Logger } from './utils/logger';
// export { default as UserService } from './services/user.service';

// ============================================
// 5. BARREL PATTERN (index.ts)
// ============================================

/*
Estructura de carpeta con barrel:

src/
├── models/
│   ├── user.ts
│   ├── product.ts
│   ├── order.ts
│   └── index.ts        ← Barrel file
├── services/
│   ├── user.service.ts
│   ├── product.service.ts
│   └── index.ts        ← Barrel file
└── utils/
    ├── validators.ts
    ├── formatters.ts
    └── index.ts        ← Barrel file
*/

// ============================================
// EJEMPLO: models/user.ts
// ============================================

export interface UserModel {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export class User2 {
  constructor(
    public id: string,
    public username: string,
    public email: string
  ) {}

  get displayName(): string {
    return `${this.username} (${this.email})`;
  }
}

export const createUser = (username: string, email: string): User2 => {
  return new User2(crypto.randomUUID(), username, email);
};

// ============================================
// EJEMPLO: models/product.ts
// ============================================

export interface ProductModel {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export class Product {
  constructor(
    public id: string,
    public name: string,
    public price: number,
    public stock: number
  ) {}

  get isAvailable(): boolean {
    return this.stock > 0;
  }

  reduceStock(quantity: number): void {
    if (quantity > this.stock) {
      throw new Error("Insufficient stock");
    }
    this.stock -= quantity;
  }
}

// ============================================
// EJEMPLO: models/index.ts (BARREL)
// ============================================

/*
// Exportar todo de user.ts
export * from './user';

// Exportar todo de product.ts
export * from './product';

// Exportar todo de order.ts
export * from './order';

// También puedes ser selectivo:
export { UserModel, User2 as User, createUser } from './user';
export { ProductModel, Product } from './product';
*/

// Simulación del barrel:
export * from "./03-modulos-y-barrels"; // Auto-referencia para ejemplo

// ============================================
// 6. USO DEL BARREL
// ============================================

/*
// SIN barrel - imports múltiples
import { UserModel } from './models/user';
import { User2 } from './models/user';
import { ProductModel } from './models/product';
import { Product } from './models/product';

// CON barrel - un solo import
import { UserModel, User2, ProductModel, Product } from './models';
*/

// ============================================
// 7. NAMESPACES (Evitar en código moderno)
// ============================================

// Namespaces son legacy de TypeScript
// Usa módulos ES6 en su lugar

namespace Validation {
  export interface StringValidator {
    isValid(s: string): boolean;
  }

  export class EmailValidator implements StringValidator {
    isValid(email: string): boolean {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
  }
}

// Uso de namespace (NO recomendado)
const emailValidator = new Validation.EmailValidator();

// ============================================
// 8. MODULE AUGMENTATION
// ============================================

// Extender módulos externos
declare module "express" {
  interface Request {
    user?: {
      id: string;
      role: string;
    };
  }
}

// Ahora req.user está tipado en Express

// ============================================
// 9. IMPORTACIONES DINÁMICAS
// ============================================

// Import dinámico para code splitting
async function loadUserModule() {
  const userModule = await import("./models/user");
  const user = userModule.createUser("john", "john@example.com");
  return user;
}

// ============================================
// 10. MEJORES PRÁCTICAS
// ============================================

/*
✅ DO:

1. Usa barrels (index.ts) para simplificar imports
2. Exporta solo lo necesario (evita export * indiscriminadamente)
3. Usa named exports sobre default exports (mejor para refactoring)
4. Organiza por features, no por tipo de archivo
5. Mantén archivos barrel al día cuando agregas/quitas exports

❌ DON'T:

1. No crees barrels circulares (A importa B, B importa A)
2. No uses namespaces en código nuevo (usa módulos ES6)
3. No mezcles default y named exports sin razón
4. No exportes todo con export * sin control
5. No hagas barrels de barrels (puede causar problemas)

📁 Estructura recomendada:

src/
├── modules/
│   ├── users/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   └── index.ts          ← Barrel
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   └── index.ts          ← Barrel
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   └── index.ts              ← Barrel del módulo
│   │
│   ├── products/
│   │   └── ... (similar estructura)
│   │
│   └── index.ts                  ← Barrel de todos los módulos
│
├── shared/
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── index.ts
│   └── index.ts
│
└── main.ts

💡 EJEMPLO DE BARREL COMPLETO:

// src/modules/users/index.ts
export * from './users.controller';
export * from './users.service';
export * from './dto';
export * from './entities';

// Ahora puedes hacer:
import { UsersController, UsersService, CreateUserDto, User } from '@modules/users';

🎯 VENTAJAS:

1. Imports más limpios y cortos
2. Fácil refactoring (cambias el barrel, no todos los imports)
3. Mejor organización del código
4. Encapsulación de la estructura interna
5. Facilita tree-shaking en bundlers
*/
