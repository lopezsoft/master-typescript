/**
 * LECCIÓN 05 - CLASES EN TYPESCRIPT
 * Archivo 01: Fundamentos de Clases
 *
 * - Propiedades y métodos
 * - Modificadores de acceso (public, private, protected)
 * - Constructor y parameter properties
 * - Propiedades readonly
 */

// ============================================
// 1. CLASE BÁSICA
// ============================================

class Product {
  // Propiedades con tipos explícitos
  id: string;
  name: string;
  price: number;

  // Constructor
  constructor(id: string, name: string, price: number) {
    this.id = id;
    this.name = name;
    this.price = price;
  }

  // Método
  getDisplayPrice(): string {
    return `$${this.price.toFixed(2)}`;
  }
}

const laptop = new Product("P001", "MacBook Pro", 2499.99);
console.log(laptop.name); // "MacBook Pro"
console.log(laptop.getDisplayPrice()); // "$2499.99"

// ============================================
// 2. MODIFICADORES DE ACCESO
// ============================================

class BankAccount {
  // public: accesible desde cualquier lugar (por defecto)
  public accountNumber: string;

  // private: solo accesible dentro de la clase
  private balance: number;

  // protected: accesible en la clase y subclases
  protected accountHolder: string;

  constructor(accountNumber: string, holder: string, initialBalance: number) {
    this.accountNumber = accountNumber;
    this.accountHolder = holder;
    this.balance = initialBalance;
  }

  // Métodos públicos para acceder a datos privados
  public getBalance(): number {
    return this.balance;
  }

  public deposit(amount: number): void {
    if (amount > 0) {
      this.balance += amount;
      this.logTransaction("deposit", amount);
    }
  }

  public withdraw(amount: number): boolean {
    if (amount > 0 && amount <= this.balance) {
      this.balance -= amount;
      this.logTransaction("withdraw", amount);
      return true;
    }
    return false;
  }

  // Método privado - solo uso interno
  private logTransaction(type: string, amount: number): void {
    console.log(`[${type.toUpperCase()}] Amount: $${amount} | New Balance: $${this.balance}`);
  }
}

const account = new BankAccount("123456", "Lewis Lopez", 1000);
account.deposit(500);
account.withdraw(200);
console.log(account.getBalance()); // 1300

// account.balance = 9999; // Error: Property 'balance' is private

// ============================================
// 3. PARAMETER PROPERTIES (SHORTHAND)
// ============================================

// TypeScript permite declarar propiedades directamente en el constructor
class User {
  // El modificador en el constructor crea y asigna automáticamente
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    private password: string
  ) {}

  validatePassword(input: string): boolean {
    return this.password === input;
  }
}

const user = new User("U001", "Lewis", "lewis@example.com", "secret123");
console.log(user.name); // "Lewis"
console.log(user.id); // "U001"
// user.id = "U002"; // Error: Cannot assign to 'id' because it is read-only
// user.password; // Error: Property 'password' is private

// ============================================
// 4. GETTERS Y SETTERS
// ============================================

class Temperature {
  private _celsius: number;

  constructor(celsius: number) {
    this._celsius = celsius;
  }

  // Getter - acceder como propiedad
  get celsius(): number {
    return this._celsius;
  }

  // Setter - asignar con validación
  set celsius(value: number) {
    if (value < -273.15) {
      throw new Error("Temperature cannot be below absolute zero");
    }
    this._celsius = value;
  }

  // Getter calculado
  get fahrenheit(): number {
    return (this._celsius * 9) / 5 + 32;
  }

  set fahrenheit(value: number) {
    this._celsius = ((value - 32) * 5) / 9;
  }

  get kelvin(): number {
    return this._celsius + 273.15;
  }
}

const temp = new Temperature(25);
console.log(temp.celsius); // 25
console.log(temp.fahrenheit); // 77
console.log(temp.kelvin); // 298.15

temp.fahrenheit = 100;
console.log(temp.celsius); // 37.78 (aprox)

// ============================================
// 5. PROPIEDADES Y MÉTODOS ESTÁTICOS
// ============================================

class MathUtils {
  // Constante estática
  static readonly PI = 3.14159265359;

  // Propiedad estática
  private static instanceCount = 0;

  // Método estático - no requiere instancia
  static circleArea(radius: number): number {
    return MathUtils.PI * radius * radius;
  }

  static circleCircumference(radius: number): number {
    return 2 * MathUtils.PI * radius;
  }

  // Método para tracking
  static getInstanceCount(): number {
    return MathUtils.instanceCount;
  }

  constructor() {
    MathUtils.instanceCount++;
  }
}

// Acceso sin crear instancia
console.log(MathUtils.PI); // 3.14159265359
console.log(MathUtils.circleArea(5)); // 78.54...
console.log(MathUtils.circleCircumference(5)); // 31.42...

// ============================================
// 6. CAMPOS PRIVADOS DE ES2022 (#)
// ============================================

class SecureVault {
  // Campo privado real de JavaScript (no solo en compilación)
  #secretCode: string;

  constructor(code: string) {
    this.#secretCode = code;
  }

  validateCode(input: string): boolean {
    return this.#secretCode === input;
  }

  // El campo # no puede ser accedido ni siquiera con type assertions
}

const vault = new SecureVault("ABC123");
console.log(vault.validateCode("ABC123")); // true
console.log(vault.validateCode("wrong")); // false
// vault.#secretCode; // Error: campo privado

export {};
