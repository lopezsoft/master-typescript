/**
 * LECCIÓN 05 - CLASES AVANZADAS
 * Archivo 04: Access Modifiers Detallado
 *
 * public, private, protected, readonly, y patrones de encapsulación.
 */

// ============================================
// 1. PUBLIC (POR DEFECTO)
// ============================================

class PublicExample {
  // Equivalente a public (por defecto)
  name: string;

  // Explícitamente public
  public age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  public greet(): string {
    return `Hello, I'm ${this.name}`;
  }
}

const person = new PublicExample("Alice", 30);
console.log(person.name); // ✅ Accesible
console.log(person.age); // ✅ Accesible
console.log(person.greet()); // ✅ Accesible

// ============================================
// 2. PRIVATE - SOLO DENTRO DE LA CLASE
// ============================================

class BankAccount {
  private balance: number = 0;
  private readonly accountNumber: string;

  constructor(accountNumber: string, initialBalance: number) {
    this.accountNumber = accountNumber;
    this.balance = initialBalance;
  }

  // Método público para acceder a dato privado
  public getBalance(): number {
    return this.balance;
  }

  public deposit(amount: number): void {
    if (amount > 0) {
      this.balance += amount;
    }
  }

  public withdraw(amount: number): boolean {
    if (amount > 0 && this.balance >= amount) {
      this.balance -= amount;
      return true;
    }
    return false;
  }

  // Método privado interno
  private calculateInterest(): number {
    return this.balance * 0.05;
  }

  public applyInterest(): void {
    const interest = this.calculateInterest();
    this.balance += interest;
  }
}

const account = new BankAccount("123456", 1000);
console.log(account.getBalance()); // ✅ 1000
// console.log(account.balance);      // ❌ Error: Property 'balance' is private
// account.calculateInterest();       // ❌ Error: Method is private

// ============================================
// 3. PROTECTED - CLASE Y SUBCLASES
// ============================================

class Animal {
  protected name: string;
  protected age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  protected makeSound(): string {
    return "Some sound";
  }

  public describe(): string {
    return `${this.name} is ${this.age} years old`;
  }
}

class Dog extends Animal {
  private breed: string;

  constructor(name: string, age: number, breed: string) {
    super(name, age);
    this.breed = breed;
  }

  public bark(): string {
    // ✅ Puede acceder a protected de la clase padre
    return `${this.name} says: ${this.makeSound()}!`;
  }

  public getInfo(): string {
    // ✅ Acceso a propiedades protected
    return `${this.name} (${this.breed}), age ${this.age}`;
  }
}

const dog = new Dog("Max", 3, "Labrador");
console.log(dog.bark()); // ✅ OK
console.log(dog.getInfo()); // ✅ OK
// console.log(dog.name);      // ❌ Error: 'name' is protected
// console.log(dog.makeSound()); // ❌ Error: 'makeSound' is protected

// ============================================
// 4. READONLY - INMUTABLE DESPUÉS DE CONSTRUCTOR
// ============================================

class User {
  readonly id: string;
  readonly createdAt: Date;
  public name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.createdAt = new Date();
    this.name = name;
  }

  public rename(newName: string): void {
    this.name = newName; // ✅ OK
    // this.id = "new-id";  // ❌ Error: Cannot assign to 'id' because it is a read-only property
  }
}

const user = new User("u1", "Alice");
console.log(user.id); // ✅ Leer OK
user.name = "Bob"; // ✅ Modificar OK
// user.id = "u2";       // ❌ Error: Cannot assign to 'id' because it is a read-only property

// ============================================
// 5. PARAMETER PROPERTIES (SHORTHAND)
// ============================================

// Forma larga
class ProductLong {
  private id: string;
  public name: string;
  private price: number;

  constructor(id: string, name: string, price: number) {
    this.id = id;
    this.name = name;
    this.price = price;
  }
}

// Forma corta con parameter properties
class ProductShort {
  constructor(
    private id: string,
    public name: string,
    private price: number
  ) {
    // Automáticamente crea y asigna las propiedades
  }

  public getPrice(): number {
    return this.price;
  }
}

const product = new ProductShort("p1", "Laptop", 999);
console.log(product.name); // ✅ "Laptop"
// console.log(product.price); // ❌ Error: 'price' is private

// ============================================
// 6. GETTERS Y SETTERS
// ============================================

class Temperature {
  private _celsius: number = 0;

  // Getter
  get celsius(): number {
    return this._celsius;
  }

  // Setter con validación
  set celsius(value: number) {
    if (value < -273.15) {
      throw new Error("Temperature below absolute zero!");
    }
    this._celsius = value;
  }

  // Computed property
  get fahrenheit(): number {
    return (this._celsius * 9) / 5 + 32;
  }

  set fahrenheit(value: number) {
    this.celsius = ((value - 32) * 5) / 9;
  }
}

const temp = new Temperature();
temp.celsius = 25;
console.log(temp.celsius); // 25
console.log(temp.fahrenheit); // 77

temp.fahrenheit = 32;
console.log(temp.celsius); // 0

// temp.celsius = -300;  // ❌ Error: Temperature below absolute zero!

// ============================================
// 7. STATIC VS INSTANCE MEMBERS
// ============================================

class Counter {
  // Static: compartido por todas las instancias
  private static count: number = 0;
  private static instances: Counter[] = [];

  // Instance: único por instancia
  private readonly instanceId: number;

  constructor(
    public name: string
  ) {
    Counter.count++;
    this.instanceId = Counter.count;
    Counter.instances.push(this);
  }

  public getInstanceId(): number {
    return this.instanceId;
  }

  // Static method
  public static getCount(): number {
    return Counter.count;
  }

  public static getAllInstances(): Counter[] {
    return [...Counter.instances];
  }
}

const c1 = new Counter("First");
const c2 = new Counter("Second");
const c3 = new Counter("Third");

console.log(Counter.getCount()); // 3
console.log(c1.getInstanceId()); // 1
console.log(c2.getInstanceId()); // 2
console.log(c3.getInstanceId()); // 3

// ============================================
// 8. PRIVATE CONSTRUCTOR (SINGLETON)
// ============================================

class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;
  private connected: boolean = false;

  // Constructor privado - no se puede instanciar desde fuera
  private constructor(
    private connectionString: string
  ) {}

  public static getInstance(connectionString: string): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection(connectionString);
    }
    return DatabaseConnection.instance;
  }

  public connect(): void {
    if (!this.connected) {
      console.log(`Connecting to ${this.connectionString}`);
      this.connected = true;
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }
}

// const db = new DatabaseConnection("..."); // ❌ Error: Constructor is private

const db1 = DatabaseConnection.getInstance("postgres://localhost");
const db2 = DatabaseConnection.getInstance("postgres://localhost");

console.log(db1 === db2); // true - misma instancia

// ============================================
// 9. PROTECTED CONSTRUCTOR (ABSTRACT BASE)
// ============================================

abstract class Shape {
  // Protected constructor - solo subclases pueden instanciar
  protected constructor(
    protected readonly id: string
  ) {}

  abstract getArea(): number;
  abstract getPerimeter(): number;
}

class Circle extends Shape {
  constructor(
    id: string,
    private radius: number
  ) {
    super(id);
  }

  getArea(): number {
    return Math.PI * this.radius ** 2;
  }

  getPerimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

// const shape = new Shape("s1");  // ❌ Error: Cannot create an instance of an abstract class
const circle = new Circle("c1", 5); // ✅ OK

// ============================================
// 10. ENCAPSULATION PATTERNS
// ============================================

// Patrón: Validation en setters
class Email {
  private _value: string;

  constructor(value: string) {
    this._value = ""; // Inicializar antes de validar
    this.value = value; // Usa el setter con validación
  }

  get value(): string {
    return this._value;
  }

  set value(newValue: string) {
    if (!this.isValid(newValue)) {
      throw new Error("Invalid email format");
    }
    this._value = newValue;
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

const email = new Email("user@example.com");
console.log(email.value);

// email.value = "invalid";  // ❌ Error: Invalid email format

// Patrón: Builder con private constructor
class UserBuilder {
  private user: {
    id?: string;
    name?: string;
    email?: string;
    age?: number;
  } = {};

  public setId(id: string): this {
    this.user.id = id;
    return this;
  }

  public setName(name: string): this {
    this.user.name = name;
    return this;
  }

  public setEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  public setAge(age: number): this {
    this.user.age = age;
    return this;
  }

  public build(): UserComplete {
    if (!this.user.id || !this.user.name || !this.user.email) {
      throw new Error("Missing required fields");
    }
    return new UserComplete(
      this.user.id,
      this.user.name,
      this.user.email,
      this.user.age
    );
  }
}

class UserComplete {
  constructor(
    private readonly id: string,
    private name: string,
    private email: string,
    private age?: number
  ) {}

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }
}

const builtUser = new UserBuilder()
  .setId("u1")
  .setName("Alice")
  .setEmail("alice@example.com")
  .setAge(30)
  .build();

// ============================================
// RESUMEN Y MEJORES PRÁCTICAS
// ============================================

/*
✅ ACCESS MODIFIERS - Guía de uso:

1. PUBLIC
   - API pública de la clase
   - Métodos que deben ser accesibles desde fuera
   - Por defecto, usar solo cuando sea intencional

2. PRIVATE
   - Detalles de implementación
   - Estado interno
   - Métodos auxiliares
   - Encapsulación fuerte

3. PROTECTED
   - Compartir con subclases
   - Hooks para extensión
   - Template Method pattern
   - Balance entre private y public

4. READONLY
   - Inmutabilidad después de construcción
   - IDs, timestamps
   - Configuración fija

💡 PATTERNS RECOMENDADOS:

// 1. Encapsulation
class Account {
  private balance: number
  public getBalance(): number { return this.balance }
}

// 2. Validation en setters
set email(value: string) {
  if (!this.validate(value)) throw new Error()
  this._email = value
}

// 3. Singleton con private constructor
private constructor() {}
static getInstance() { ... }

// 4. Parameter properties
constructor(
  private id: string,
  public name: string,
  protected readonly createdAt: Date
) {}

// 5. Getters computados
get fullName(): string {
  return `${this.firstName} ${this.lastName}`
}

⚠️ CUIDADOS:

1. No sobre-usar private (dificulta testing)
2. Prefer readonly sobre getters when possible
3. Validar en setters
4. Documentar por qué algo es protected
5. Static vs instance members (conocer la diferencia)

🎯 REGLAS GENERALES:

- Empezar con private
- Hacer public solo lo necesario
- Protected para extensión intencional
- Readonly para inmutabilidad
- Getters/setters para lógica adicional

📊 TESTING:

- Private dificulta unit testing
- Considerar package-private (no en TS)
- Test through public API
- O usar reflexión (no recomendado)
*/

export {
  BankAccount,
  Dog,
  User,
  ProductShort,
  Temperature,
  Counter,
  DatabaseConnection,
  Circle,
  Email,
  UserBuilder,
};
