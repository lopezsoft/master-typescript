/**
 * LECCIÓN 07 - UTILITY TYPES EN TYPESCRIPT
 * Archivo 01: Partial, Required, Readonly
 *
 * TypeScript incluye tipos de utilidad integrados que facilitan
 * la transformación de tipos existentes.
 */

// ============================================
// TIPO BASE PARA EJEMPLOS
// ============================================

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  address?: string;
  phone?: string;
}

// ============================================
// 1. PARTIAL<T> - Todas las propiedades opcionales
// ============================================

// Partial hace que todas las propiedades sean opcionales
type PartialUser = Partial<User>;

// Útil para updates parciales
function updateUser(id: string, updates: Partial<User>): User {
  const existingUser: User = {
    id,
    name: "John",
    email: "john@example.com",
    age: 30,
  };

  return { ...existingUser, ...updates };
}

// Solo actualizamos lo que necesitamos
const updated = updateUser("1", { name: "John Doe", age: 31 });
console.log(updated);

// Patrón Builder con Partial
class UserBuilder {
  private user: Partial<User> = {};

  setId(id: string): this {
    this.user.id = id;
    return this;
  }

  setName(name: string): this {
    this.user.name = name;
    return this;
  }

  setEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  setAge(age: number): this {
    this.user.age = age;
    return this;
  }

  build(): User {
    if (!this.user.id || !this.user.name || !this.user.email || !this.user.age) {
      throw new Error("Missing required fields");
    }
    return this.user as User;
  }
}

const user = new UserBuilder()
  .setId("U001")
  .setName("Alice")
  .setEmail("alice@example.com")
  .setAge(25)
  .build();

console.log(user);

// ============================================
// 2. REQUIRED<T> - Todas las propiedades requeridas
// ============================================

// Required hace que TODAS las propiedades sean obligatorias
type RequiredUser = Required<User>;

// Ahora address y phone son obligatorios
const completeUser: RequiredUser = {
  id: "U002",
  name: "Bob",
  email: "bob@example.com",
  age: 28,
  address: "123 Main St", // Ahora requerido
  phone: "+1234567890", // Ahora requerido
};

console.log(completeUser);

// Útil para validaciones
function validateUserComplete(user: User): user is RequiredUser {
  return (
    user.id !== undefined &&
    user.name !== undefined &&
    user.email !== undefined &&
    user.age !== undefined &&
    user.address !== undefined &&
    user.phone !== undefined
  );
}

// ============================================
// 3. READONLY<T> - Propiedades inmutables
// ============================================

// Readonly hace que todas las propiedades no puedan ser modificadas
type ReadonlyUser = Readonly<User>;

const frozenUser: ReadonlyUser = {
  id: "U003",
  name: "Charlie",
  email: "charlie@example.com",
  age: 35,
};

// frozenUser.name = "Charles"; // Error: Cannot assign to 'name' because it is read-only

// Útil para configuraciones
interface AppConfig {
  apiUrl: string;
  timeout: number;
  debug: boolean;
}

function createConfig(config: AppConfig): Readonly<AppConfig> {
  return Object.freeze(config);
}

const config = createConfig({
  apiUrl: "https://api.example.com",
  timeout: 5000,
  debug: false,
});

// config.timeout = 10000; // Error en TypeScript Y en runtime

// ============================================
// 4. DEEP READONLY (Personalizado)
// ============================================

// Readonly solo funciona en el primer nivel
interface NestedData {
  user: {
    name: string;
    settings: {
      theme: string;
    };
  };
}

// Crear DeepReadonly personalizado
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

const deepData: DeepReadonly<NestedData> = {
  user: {
    name: "David",
    settings: {
      theme: "dark",
    },
  },
};

// deepData.user.name = "Dave"; // Error
// deepData.user.settings.theme = "light"; // Error

// ============================================
// 5. COMBINACIONES
// ============================================

// Partial + Readonly: Para configuraciones parciales inmutables
type PartialReadonlyUser = Readonly<Partial<User>>;

// Required solo para algunas propiedades
type UserWithRequiredContact = Required<Pick<User, "email" | "phone">> &
  Omit<User, "email" | "phone">;

const userWithContact: UserWithRequiredContact = {
  id: "U004",
  name: "Eve",
  age: 29,
  email: "eve@example.com", // Requerido
  phone: "+0987654321", // Requerido
  // address sigue siendo opcional
};

console.log(userWithContact);

export {};
