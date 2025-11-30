/**
 * LECCIÓN 05 - CLASES EN TYPESCRIPT
 * Archivo 02: Herencia y Polimorfismo
 *
 * - extends para herencia
 * - super para acceder a la clase padre
 * - Override de métodos
 * - Polimorfismo
 */

// ============================================
// 1. HERENCIA BÁSICA (EXTENDS)
// ============================================

class Animal {
  constructor(
    public name: string,
    protected age: number
  ) {}

  speak(): string {
    return `${this.name} makes a sound`;
  }

  getInfo(): string {
    return `${this.name} is ${this.age} years old`;
  }
}

class Dog extends Animal {
  constructor(
    name: string,
    age: number,
    public breed: string
  ) {
    // super() llama al constructor de la clase padre
    super(name, age);
  }

  // Override del método speak
  speak(): string {
    return `${this.name} barks: Woof!`;
  }

  // Método específico de Dog
  fetch(): string {
    return `${this.name} fetches the ball`;
  }
}

class Cat extends Animal {
  constructor(
    name: string,
    age: number,
    public isIndoor: boolean
  ) {
    super(name, age);
  }

  speak(): string {
    return `${this.name} meows: Meow!`;
  }

  purr(): string {
    return `${this.name} is purring`;
  }
}

const dog = new Dog("Max", 3, "Golden Retriever");
const cat = new Cat("Whiskers", 5, true);

console.log(dog.speak()); // "Max barks: Woof!"
console.log(cat.speak()); // "Whiskers meows: Meow!"
console.log(dog.fetch()); // "Max fetches the ball"

// ============================================
// 2. POLIMORFISMO
// ============================================

// Una función que trabaja con la clase base
function makeAnimalSpeak(animal: Animal): void {
  console.log(animal.speak());
}

// Funciona con cualquier subclase
makeAnimalSpeak(dog); // "Max barks: Woof!"
makeAnimalSpeak(cat); // "Whiskers meows: Meow!"

// Array de diferentes tipos de animales
const animals: Animal[] = [
  new Dog("Buddy", 2, "Labrador"),
  new Cat("Luna", 4, false),
  new Dog("Rocky", 5, "German Shepherd"),
];

animals.forEach((animal) => {
  console.log(animal.speak());
});

// ============================================
// 3. SUPER PARA EXTENDER COMPORTAMIENTO
// ============================================

class Vehicle {
  constructor(
    public brand: string,
    public model: string,
    protected speed: number = 0
  ) {}

  accelerate(amount: number): void {
    this.speed += amount;
    console.log(`${this.brand} ${this.model} speed: ${this.speed} km/h`);
  }

  brake(amount: number): void {
    this.speed = Math.max(0, this.speed - amount);
    console.log(`${this.brand} ${this.model} speed: ${this.speed} km/h`);
  }

  getStatus(): string {
    return `${this.brand} ${this.model} - Current speed: ${this.speed} km/h`;
  }
}

class ElectricCar extends Vehicle {
  constructor(
    brand: string,
    model: string,
    public batteryCapacity: number,
    private batteryLevel: number = 100
  ) {
    super(brand, model);
  }

  // Extender el método padre
  accelerate(amount: number): void {
    if (this.batteryLevel <= 0) {
      console.log("Battery empty! Cannot accelerate.");
      return;
    }
    // Llamar al método padre
    super.accelerate(amount);
    // Añadir comportamiento adicional
    this.batteryLevel -= amount * 0.5;
    console.log(`Battery level: ${this.batteryLevel.toFixed(1)}%`);
  }

  charge(): void {
    this.batteryLevel = 100;
    console.log("Battery fully charged!");
  }

  // Override con extensión
  getStatus(): string {
    // Obtener estado base y añadir info de batería
    return `${super.getStatus()} | Battery: ${this.batteryLevel.toFixed(1)}%`;
  }
}

const tesla = new ElectricCar("Tesla", "Model 3", 75);
tesla.accelerate(50);
tesla.accelerate(30);
console.log(tesla.getStatus());

// ============================================
// 4. INSTANCEOF PARA TYPE CHECKING
// ============================================

function processVehicle(vehicle: Vehicle): void {
  console.log(vehicle.getStatus());

  // Verificar si es un tipo específico
  if (vehicle instanceof ElectricCar) {
    // TypeScript ahora sabe que es ElectricCar
    console.log(`Battery capacity: ${vehicle.batteryCapacity} kWh`);
    vehicle.charge();
  }
}

const regularCar = new Vehicle("Toyota", "Corolla");
const electricCar = new ElectricCar("Rivian", "R1T", 135);

processVehicle(regularCar);
processVehicle(electricCar);

// ============================================
// 5. CADENA DE HERENCIA
// ============================================

class Shape {
  constructor(public color: string) {}

  describe(): string {
    return `A ${this.color} shape`;
  }
}

class Polygon extends Shape {
  constructor(
    color: string,
    public sides: number
  ) {
    super(color);
  }

  describe(): string {
    return `A ${this.color} polygon with ${this.sides} sides`;
  }
}

class Rectangle extends Polygon {
  constructor(
    color: string,
    public width: number,
    public height: number
  ) {
    super(color, 4);
  }

  area(): number {
    return this.width * this.height;
  }

  describe(): string {
    return `${super.describe()} (${this.width}x${this.height})`;
  }
}

class Square extends Rectangle {
  constructor(color: string, size: number) {
    super(color, size, size);
  }

  describe(): string {
    return `A ${this.color} square of size ${this.width}`;
  }
}

const shapes: Shape[] = [
  new Shape("red"),
  new Polygon("blue", 6),
  new Rectangle("green", 10, 5),
  new Square("yellow", 4),
];

shapes.forEach((shape) => {
  console.log(shape.describe());
});

export {};
