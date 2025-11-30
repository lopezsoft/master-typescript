/**
 * LECCIÓN 05 - CLASES EN TYPESCRIPT
 * Archivo 03: Interfaces y Clases Abstractas
 *
 * - implements para implementar interfaces
 * - Clases abstractas (abstract)
 * - Diferencias entre interface y abstract class
 */

// ============================================
// 1. IMPLEMENTAR INTERFACES (implements)
// ============================================

// Interface define el contrato
interface Printable {
  print(): string;
}

interface Serializable {
  toJSON(): string;
  fromJSON(json: string): void;
}

// Una clase puede implementar múltiples interfaces
class Document implements Printable, Serializable {
  constructor(
    public title: string,
    public content: string
  ) {}

  print(): string {
    return `
=== ${this.title.toUpperCase()} ===
${this.content}
========================`;
  }

  toJSON(): string {
    return JSON.stringify({ title: this.title, content: this.content });
  }

  fromJSON(json: string): void {
    const data = JSON.parse(json);
    this.title = data.title;
    this.content = data.content;
  }
}

const doc = new Document("Report", "This is the report content.");
console.log(doc.print());
console.log(doc.toJSON());

// ============================================
// 2. INTERFACE CON PROPIEDADES Y MÉTODOS
// ============================================

interface Repository<T> {
  items: T[];
  add(item: T): void;
  remove(id: string): boolean;
  findById(id: string): T | undefined;
  getAll(): T[];
}

interface Entity {
  id: string;
}

interface User extends Entity {
  name: string;
  email: string;
}

class UserRepository implements Repository<User> {
  items: User[] = [];

  add(user: User): void {
    this.items.push(user);
  }

  remove(id: string): boolean {
    const index = this.items.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  findById(id: string): User | undefined {
    return this.items.find((u) => u.id === id);
  }

  getAll(): User[] {
    return [...this.items];
  }
}

const userRepo = new UserRepository();
userRepo.add({ id: "1", name: "Alice", email: "alice@example.com" });
userRepo.add({ id: "2", name: "Bob", email: "bob@example.com" });
console.log(userRepo.getAll());

// ============================================
// 3. CLASES ABSTRACTAS
// ============================================

// abstract class: no se puede instanciar directamente
abstract class PaymentProcessor {
  constructor(protected amount: number) {}

  // Método abstracto: debe ser implementado por subclases
  abstract processPayment(): Promise<boolean>;

  // Método abstracto con tipo de retorno específico
  abstract getProviderName(): string;

  // Método concreto: implementación compartida
  validateAmount(): boolean {
    return this.amount > 0;
  }

  // Template method pattern
  async executePayment(): Promise<boolean> {
    console.log(`Processing payment of $${this.amount}...`);

    if (!this.validateAmount()) {
      console.log("Invalid amount!");
      return false;
    }

    const result = await this.processPayment();
    console.log(result ? "Payment successful!" : "Payment failed!");
    return result;
  }
}

class StripeProcessor extends PaymentProcessor {
  constructor(amount: number, private apiKey: string) {
    super(amount);
  }

  getProviderName(): string {
    return "Stripe";
  }

  async processPayment(): Promise<boolean> {
    // Simulación de llamada a API de Stripe
    console.log(`[${this.getProviderName()}] Charging $${this.amount}...`);
    return true;
  }
}

class PayPalProcessor extends PaymentProcessor {
  constructor(amount: number, private clientId: string) {
    super(amount);
  }

  getProviderName(): string {
    return "PayPal";
  }

  async processPayment(): Promise<boolean> {
    // Simulación de llamada a API de PayPal
    console.log(`[${this.getProviderName()}] Processing $${this.amount}...`);
    return true;
  }
}

// const processor = new PaymentProcessor(100); // Error: Cannot create instance of abstract class

const stripe = new StripeProcessor(99.99, "sk_test_xxx");
stripe.executePayment();

const paypal = new PayPalProcessor(49.99, "client_xxx");
paypal.executePayment();

// ============================================
// 4. PROPIEDADES ABSTRACTAS
// ============================================

abstract class NotificationService {
  // Propiedad abstracta
  abstract readonly channel: string;

  // Método abstracto
  abstract send(to: string, message: string): Promise<void>;

  // Método concreto que usa la propiedad abstracta
  log(to: string, message: string): void {
    console.log(`[${this.channel}] Sending to ${to}: ${message}`);
  }
}

class EmailNotification extends NotificationService {
  readonly channel = "EMAIL";

  async send(to: string, message: string): Promise<void> {
    this.log(to, message);
    // Lógica de envío de email
  }
}

class SMSNotification extends NotificationService {
  readonly channel = "SMS";

  async send(to: string, message: string): Promise<void> {
    this.log(to, message);
    // Lógica de envío de SMS
  }
}

const emailService = new EmailNotification();
const smsService = new SMSNotification();

emailService.send("user@example.com", "Welcome!");
smsService.send("+1234567890", "Your code is 1234");

// ============================================
// 5. COMBINAR ABSTRACT CLASS E INTERFACE
// ============================================

interface Loggable {
  log(message: string): void;
}

interface Configurable {
  configure(options: Record<string, unknown>): void;
}

abstract class BaseService implements Loggable, Configurable {
  protected config: Record<string, unknown> = {};

  // Implementación de Loggable
  log(message: string): void {
    console.log(`[${this.getServiceName()}] ${message}`);
  }

  // Implementación de Configurable
  configure(options: Record<string, unknown>): void {
    this.config = { ...this.config, ...options };
    this.log(`Configured with ${JSON.stringify(options)}`);
  }

  // Método abstracto
  abstract getServiceName(): string;

  // Método abstracto
  abstract execute(): Promise<void>;
}

class DataSyncService extends BaseService {
  getServiceName(): string {
    return "DataSync";
  }

  async execute(): Promise<void> {
    this.log("Starting data synchronization...");
    // Lógica de sincronización
    this.log("Synchronization complete!");
  }
}

const syncService = new DataSyncService();
syncService.configure({ interval: 3600, retries: 3 });
syncService.execute();

// ============================================
// 6. CUÁNDO USAR CADA UNO
// ============================================

/*
 * INTERFACE vs ABSTRACT CLASS:
 *
 * USE INTERFACE cuando:
 * - Solo necesita definir un contrato (shape)
 * - Una clase debe implementar múltiples contratos
 * - No hay implementación compartida
 * - Quiere mantener el acoplamiento bajo
 *
 * USE ABSTRACT CLASS cuando:
 * - Necesita compartir implementación entre clases
 * - Las subclases comparten estado (propiedades)
 * - Quiere usar el patrón Template Method
 * - Necesita definir constructores con lógica
 */

export {};
