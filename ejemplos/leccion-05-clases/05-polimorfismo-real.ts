/**
 * LECCIÓN 05 - CLASES AVANZADAS
 * Archivo 05: Polimorfismo Real
 *
 * Polimorfismo, method overriding, super, duck typing, y patrones polimórficos.
 */

// ============================================
// 1. POLIMORFISMO BÁSICO CON HERENCIA
// ============================================

abstract class Shape {
  constructor(protected color: string) {}

  abstract getArea(): number;
  abstract getPerimeter(): number;

  // Método común a todas las formas
  public describe(): string {
    return `A ${this.color} shape with area ${this.getArea().toFixed(2)}`;
  }
}

class Circle extends Shape {
  constructor(
    color: string,
    private radius: number
  ) {
    super(color);
  }

  getArea(): number {
    return Math.PI * this.radius ** 2;
  }

  getPerimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

class Rectangle extends Shape {
  constructor(
    color: string,
    private width: number,
    private height: number
  ) {
    super(color);
  }

  getArea(): number {
    return this.width * this.height;
  }

  getPerimeter(): number {
    return 2 * (this.width + this.height);
  }
}

class Triangle extends Shape {
  constructor(
    color: string,
    private base: number,
    private height: number,
    private side1: number,
    private side2: number
  ) {
    super(color);
  }

  getArea(): number {
    return (this.base * this.height) / 2;
  }

  getPerimeter(): number {
    return this.base + this.side1 + this.side2;
  }
}

// Polimorfismo en acción
function printShapeInfo(shape: Shape): void {
  console.log(shape.describe());
  console.log(`Area: ${shape.getArea()}`);
  console.log(`Perimeter: ${shape.getPerimeter()}`);
}

const shapes: Shape[] = [
  new Circle("red", 5),
  new Rectangle("blue", 10, 5),
  new Triangle("green", 6, 4, 5, 5),
];

shapes.forEach(printShapeInfo);

// ============================================
// 2. METHOD OVERRIDING
// ============================================

class Animal {
  constructor(protected name: string) {}

  makeSound(): string {
    return "Some generic sound";
  }

  introduce(): string {
    return `I'm ${this.name} and I say: ${this.makeSound()}`;
  }
}

class Dog extends Animal {
  // Override completo
  makeSound(): string {
    return "Woof! Woof!";
  }
}

class Cat extends Animal {
  makeSound(): string {
    return "Meow!";
  }

  // Override con funcionalidad adicional
  introduce(): string {
    return `${super.introduce()} *purrs*`;
  }
}

class Bird extends Animal {
  makeSound(): string {
    return "Tweet! Tweet!";
  }

  // Método específico de Bird
  fly(): string {
    return `${this.name} is flying!`;
  }
}

const animals: Animal[] = [
  new Dog("Max"),
  new Cat("Whiskers"),
  new Bird("Tweety"),
];

animals.forEach((animal) => {
  console.log(animal.introduce());
});

// ============================================
// 3. SUPER - LLAMAR A MÉTODO DEL PADRE
// ============================================

class Logger {
  protected logs: string[] = [];

  log(message: string): void {
    const timestamp = new Date().toISOString();
    this.logs.push(`[${timestamp}] ${message}`);
  }

  getLogs(): string[] {
    return [...this.logs];
  }
}

class FileLogger extends Logger {
  constructor(private filename: string) {
    super();
  }

  // Override que usa super
  log(message: string): void {
    // Llamar al método del padre
    super.log(message);

    // Funcionalidad adicional
    this.writeToFile(message);
  }

  private writeToFile(message: string): void {
    console.log(`Writing to ${this.filename}: ${message}`);
  }
}

class ConsoleLogger extends Logger {
  log(message: string): void {
    super.log(message);
    console.log(message);
  }
}

const fileLogger = new FileLogger("app.log");
fileLogger.log("Application started");
fileLogger.log("User logged in");

// ============================================
// 4. POLIMORFISMO CON INTERFACES
// ============================================

interface Drawable {
  draw(): void;
}

interface Movable {
  move(x: number, y: number): void;
}

interface Resizable {
  resize(factor: number): void;
}

// Clase que implementa múltiples interfaces
class GraphicElement implements Drawable, Movable, Resizable {
  constructor(
    private x: number = 0,
    private y: number = 0,
    private size: number = 1
  ) {}

  draw(): void {
    console.log(`Drawing at (${this.x}, ${this.y}) with size ${this.size}`);
  }

  move(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  resize(factor: number): void {
    this.size *= factor;
  }
}

// Función polimórfica - acepta cualquier Drawable
function render(drawable: Drawable): void {
  drawable.draw();
}

// Función polimórfica - acepta Drawable y Movable
function renderAndMove(element: Drawable & Movable, x: number, y: number): void {
  element.move(x, y);
  element.draw();
}

const element = new GraphicElement(10, 20, 1);
render(element);
renderAndMove(element, 50, 50);

// ============================================
// 5. DUCK TYPING (STRUCTURAL TYPING)
// ============================================

// TypeScript usa structural typing
interface Quackable {
  quack(): void;
}

class Duck {
  quack(): void {
    console.log("Quack!");
  }
}

class Person {
  name: string = "John";

  quack(): void {
    console.log("I'm imitating a duck: Quack!");
  }
}

// Ambos son Quackable porque tienen el método quack()
function makeItQuack(thing: Quackable): void {
  thing.quack();
}

makeItQuack(new Duck()); // ✅ OK
makeItQuack(new Person()); // ✅ OK - duck typing!

// ============================================
// 6. LISKOV SUBSTITUTION PRINCIPLE
// ============================================

// Base: un rectángulo tiene width y height independientes
class RegularRectangle {
  constructor(
    protected width: number,
    protected height: number
  ) {}

  setWidth(width: number): void {
    this.width = width;
  }

  setHeight(height: number): void {
    this.height = height;
  }

  getArea(): number {
    return this.width * this.height;
  }
}

// ❌ MAL: Square viola LSP
class BadSquare extends RegularRectangle {
  setWidth(width: number): void {
    this.width = width;
    this.height = width; // Viola expectativa de Rectangle
  }

  setHeight(height: number): void {
    this.width = height;
    this.height = height;
  }
}

// ✅ BIEN: Composición en vez de herencia
interface Size {
  getArea(): number;
}

class GoodSquare implements Size {
  constructor(private side: number) {}

  setSide(side: number): void {
    this.side = side;
  }

  getArea(): number {
    return this.side ** 2;
  }
}

class GoodRectangle implements Size {
  constructor(
    private width: number,
    private height: number
  ) {}

  setWidth(width: number): void {
    this.width = width;
  }

  setHeight(height: number): void {
    this.height = height;
  }

  getArea(): number {
    return this.width * this.height;
  }
}

// ============================================
// 7. STRATEGY PATTERN (POLIMORFISMO EN ACCIÓN)
// ============================================

interface PaymentStrategy {
  pay(amount: number): void;
}

class CreditCardPayment implements PaymentStrategy {
  constructor(
    private cardNumber: string,
    private cvv: string
  ) {}

  pay(amount: number): void {
    console.log(`Paying $${amount} with credit card ${this.cardNumber}`);
  }
}

class PayPalPayment implements PaymentStrategy {
  constructor(private email: string) {}

  pay(amount: number): void {
    console.log(`Paying $${amount} via PayPal (${this.email})`);
  }
}

class CryptoPayment implements PaymentStrategy {
  constructor(private walletAddress: string) {}

  pay(amount: number): void {
    console.log(`Paying $${amount} with crypto to ${this.walletAddress}`);
  }
}

// Contexto que usa la estrategia
class ShoppingCart {
  private items: Array<{ name: string; price: number }> = [];

  addItem(name: string, price: number): void {
    this.items.push({ name, price });
  }

  checkout(paymentStrategy: PaymentStrategy): void {
    const total = this.items.reduce((sum, item) => sum + item.price, 0);
    paymentStrategy.pay(total);
  }
}

const cart = new ShoppingCart();
cart.addItem("Laptop", 999);
cart.addItem("Mouse", 25);

// Cambiar estrategia en runtime
cart.checkout(new CreditCardPayment("1234-5678-9012-3456", "123"));
cart.checkout(new PayPalPayment("user@example.com"));
cart.checkout(new CryptoPayment("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"));

// ============================================
// 8. TEMPLATE METHOD PATTERN
// ============================================

abstract class DataProcessor {
  // Template method - define el algoritmo
  public process(): void {
    this.loadData();
    this.validateData();
    this.transformData();
    this.saveData();
  }

  protected abstract loadData(): void;
  protected abstract validateData(): void;
  protected abstract transformData(): void;

  // Método con implementación por defecto
  protected saveData(): void {
    console.log("Saving data to database...");
  }
}

class CSVProcessor extends DataProcessor {
  protected loadData(): void {
    console.log("Loading data from CSV file...");
  }

  protected validateData(): void {
    console.log("Validating CSV data...");
  }

  protected transformData(): void {
    console.log("Transforming CSV to JSON...");
  }
}

class JSONProcessor extends DataProcessor {
  protected loadData(): void {
    console.log("Loading data from JSON file...");
  }

  protected validateData(): void {
    console.log("Validating JSON schema...");
  }

  protected transformData(): void {
    console.log("Normalizing JSON structure...");
  }

  // Override del método con implementación por defecto
  protected saveData(): void {
    console.log("Saving data to NoSQL database...");
  }
}

const csvProcessor = new CSVProcessor();
csvProcessor.process();

const jsonProcessor = new JSONProcessor();
jsonProcessor.process();

// ============================================
// 9. VISITOR PATTERN (POLIMORFISMO DOBLE)
// ============================================

interface ShapeVisitor {
  visitCircle(circle: VisitableCircle): void;
  visitRectangle(rectangle: VisitableRectangle): void;
}

interface VisitableShape {
  accept(visitor: ShapeVisitor): void;
}

class VisitableCircle implements VisitableShape {
  constructor(public radius: number) {}

  accept(visitor: ShapeVisitor): void {
    visitor.visitCircle(this);
  }
}

class VisitableRectangle implements VisitableShape {
  constructor(
    public width: number,
    public height: number
  ) {}

  accept(visitor: ShapeVisitor): void {
    visitor.visitRectangle(this);
  }
}

// Visitor concreto: calcular área
class AreaCalculator implements ShapeVisitor {
  private totalArea: number = 0;

  visitCircle(circle: VisitableCircle): void {
    this.totalArea += Math.PI * circle.radius ** 2;
  }

  visitRectangle(rectangle: VisitableRectangle): void {
    this.totalArea += rectangle.width * rectangle.height;
  }

  getTotalArea(): number {
    return this.totalArea;
  }
}

// Visitor concreto: serializar a JSON
class JSONSerializer implements ShapeVisitor {
  private result: any[] = [];

  visitCircle(circle: VisitableCircle): void {
    this.result.push({ type: "circle", radius: circle.radius });
  }

  visitRectangle(rectangle: VisitableRectangle): void {
    this.result.push({
      type: "rectangle",
      width: rectangle.width,
      height: rectangle.height,
    });
  }

  getJSON(): string {
    return JSON.stringify(this.result);
  }
}

const visitableShapes: VisitableShape[] = [
  new VisitableCircle(5),
  new VisitableRectangle(10, 5),
  new VisitableCircle(3),
];

const areaCalc = new AreaCalculator();
visitableShapes.forEach((shape) => shape.accept(areaCalc));
console.log("Total area:", areaCalc.getTotalArea());

const serializer = new JSONSerializer();
visitableShapes.forEach((shape) => shape.accept(serializer));
console.log("JSON:", serializer.getJSON());

// ============================================
// RESUMEN Y MEJORES PRÁCTICAS
// ============================================

/*
✅ POLIMORFISMO - Conceptos clave:

1. HERENCIA
   - Substituir implementaciones
   - Override de métodos
   - super para reusar código del padre

2. INTERFACES
   - Contratos sin implementación
   - Múltiples interfaces (TypeScript)
   - Structural typing (duck typing)

3. ABSTRACT CLASSES
   - Base común con métodos abstractos
   - Template Method pattern
   - Shared state/behavior

4. COMPOSITION OVER INHERITANCE
   - Strategy pattern
   - Dependency injection
   - Más flexible

💡 PATTERNS POLIMÓRFICOS:

// 1. Strategy - algoritmos intercambiables
interface Strategy { execute(): void }

// 2. Template Method - esqueleto de algoritmo
abstract class Template {
  process() { this.step1(); this.step2(); }
  abstract step1(): void
}

// 3. Visitor - operaciones sobre estructura
interface Visitor { visit(element: Element): void }

// 4. State - comportamiento basado en estado
interface State { handle(): void }

⚠️ PRINCIPIOS:

1. LISKOV SUBSTITUTION
   - Subclases deben ser sustituibles por su base
   - No violar contratos
   - Precondiciones no más fuertes, postcondiciones no más débiles

2. OPEN/CLOSED
   - Abierto para extensión
   - Cerrado para modificación
   - Extend mediante herencia/interfaces

3. DEPENDENCY INVERSION
   - Depender de abstracciones
   - No de implementaciones concretas
   - Interfaces sobre clases concretas

🎯 CUÁNDO USAR:

✅ Strategy → Múltiples algoritmos
✅ Template Method → Algoritmo fijo con pasos variables
✅ Visitor → Operaciones sobre estructura compleja
✅ State → Comportamiento cambia con estado
✅ Interfaces → Contratos sin acoplamiento

📊 TESTING:

- Polimorfismo facilita testing
- Mock implementations
- Test doubles
- Dependency injection
*/

export {
  Shape,
  Circle,
  Rectangle,
  Triangle,
  FileLogger,
  GraphicElement,
  ShoppingCart,
  CreditCardPayment,
  CSVProcessor,
  AreaCalculator,
};
