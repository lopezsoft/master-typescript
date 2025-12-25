/**
 * RETO LECCIÓN 07-08: Sistema de Validación Type-Safe - SOLUCIÓN
 */

// ============================================
// TIPOS BASE
// ============================================

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] };

interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// ============================================
// TYPE GUARDS BÁSICOS
// ============================================

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNull(value: unknown): value is null {
  return value === null;
}

function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

// ============================================
// TYPE GUARDS AVANZADOS
// ============================================

function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] {
  return isArray(value) && value.every(guard);
}

function isRecordOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is Record<string, T> {
  if (!isObject(value)) return false;

  return Object.values(value).every(guard);
}

// ============================================
// ASSERTION FUNCTIONS
// ============================================

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIsString(value: unknown): asserts value is string {
  if (!isString(value)) {
    throw new Error(`Expected string but got ${typeof value}`);
  }
}

function assertIsNumber(value: unknown): asserts value is number {
  if (!isNumber(value)) {
    throw new Error(`Expected number but got ${typeof value}`);
  }
}

function assertNonNull<T>(value: T): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error("Value is null or undefined");
  }
}

// ============================================
// VALIDATORS
// ============================================

abstract class Validator<T> {
  abstract validate(value: unknown): ValidationResult<T>;

  optional(): Validator<T | undefined> {
    return new OptionalValidator(this);
  }

  nullable(): Validator<T | null> {
    return new NullableValidator(this);
  }

  default(defaultValue: T): Validator<T> {
    return new DefaultValidator(this, defaultValue);
  }

  refine(
    check: (value: T) => boolean,
    message: string
  ): Validator<T> {
    return new RefineValidator(this, check, message);
  }
}

class OptionalValidator<T> extends Validator<T | undefined> {
  constructor(private inner: Validator<T>) {
    super();
  }

  validate(value: unknown): ValidationResult<T | undefined> {
    if (value === undefined) {
      return { success: true, data: undefined };
    }
    return this.inner.validate(value);
  }
}

class NullableValidator<T> extends Validator<T | null> {
  constructor(private inner: Validator<T>) {
    super();
  }

  validate(value: unknown): ValidationResult<T | null> {
    if (value === null) {
      return { success: true, data: null };
    }
    return this.inner.validate(value);
  }
}

class DefaultValidator<T> extends Validator<T> {
  constructor(private inner: Validator<T>, private defaultValue: T) {
    super();
  }

  validate(value: unknown): ValidationResult<T> {
    if (value === undefined) {
      return { success: true, data: this.defaultValue };
    }
    return this.inner.validate(value);
  }
}

class RefineValidator<T> extends Validator<T> {
  constructor(
    private inner: Validator<T>,
    private check: (value: T) => boolean,
    private message: string
  ) {
    super();
  }

  validate(value: unknown): ValidationResult<T> {
    const result = this.inner.validate(value);

    if (!result.success) {
      return result;
    }

    if (!this.check(result.data)) {
      return {
        success: false,
        errors: [{ field: "value", message: this.message }],
      };
    }

    return result;
  }
}

// ============================================
// STRING VALIDATOR
// ============================================

class StringValidator extends Validator<string> {
  private minLength?: number;
  private maxLength?: number;
  private pattern?: RegExp;
  private _email: boolean = false;
  private _url: boolean = false;

  validate(value: unknown): ValidationResult<string> {
    if (!isString(value)) {
      return {
        success: false,
        errors: [{ field: "value", message: "Expected string" }],
      };
    }

    const errors: ValidationError[] = [];

    if (this.minLength !== undefined && value.length < this.minLength) {
      errors.push({
        field: "value",
        message: `String must be at least ${this.minLength} characters`,
      });
    }

    if (this.maxLength !== undefined && value.length > this.maxLength) {
      errors.push({
        field: "value",
        message: `String must be at most ${this.maxLength} characters`,
      });
    }

    if (this.pattern && !this.pattern.test(value)) {
      errors.push({
        field: "value",
        message: `String does not match pattern`,
      });
    }

    if (this._email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push({
          field: "value",
          message: "Invalid email format",
        });
      }
    }

    if (this._url) {
      try {
        new URL(value);
      } catch {
        errors.push({
          field: "value",
          message: "Invalid URL format",
        });
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: value };
  }

  min(length: number): this {
    this.minLength = length;
    return this;
  }

  max(length: number): this {
    this.maxLength = length;
    return this;
  }

  regex(pattern: RegExp): this {
    this.pattern = pattern;
    return this;
  }

  email(): this {
    this._email = true;
    return this;
  }

  url(): this {
    this._url = true;
    return this;
  }
}

function string(): StringValidator {
  return new StringValidator();
}

// ============================================
// NUMBER VALIDATOR
// ============================================

class NumberValidator extends Validator<number> {
  private minValue?: number;
  private maxValue?: number;
  private _integer: boolean = false;
  private _positive: boolean = false;
  private _negative: boolean = false;

  validate(value: unknown): ValidationResult<number> {
    if (!isNumber(value)) {
      return {
        success: false,
        errors: [{ field: "value", message: "Expected number" }],
      };
    }

    const errors: ValidationError[] = [];

    if (this.minValue !== undefined && value < this.minValue) {
      errors.push({
        field: "value",
        message: `Number must be at least ${this.minValue}`,
      });
    }

    if (this.maxValue !== undefined && value > this.maxValue) {
      errors.push({
        field: "value",
        message: `Number must be at most ${this.maxValue}`,
      });
    }

    if (this._integer && !Number.isInteger(value)) {
      errors.push({
        field: "value",
        message: "Number must be an integer",
      });
    }

    if (this._positive && value <= 0) {
      errors.push({
        field: "value",
        message: "Number must be positive",
      });
    }

    if (this._negative && value >= 0) {
      errors.push({
        field: "value",
        message: "Number must be negative",
      });
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: value };
  }

  min(value: number): this {
    this.minValue = value;
    return this;
  }

  max(value: number): this {
    this.maxValue = value;
    return this;
  }

  integer(): this {
    this._integer = true;
    return this;
  }

  positive(): this {
    this._positive = true;
    return this;
  }

  negative(): this {
    this._negative = true;
    return this;
  }
}

function number(): NumberValidator {
  return new NumberValidator();
}

// ============================================
// BOOLEAN VALIDATOR
// ============================================

class BooleanValidator extends Validator<boolean> {
  validate(value: unknown): ValidationResult<boolean> {
    if (!isBoolean(value)) {
      return {
        success: false,
        errors: [{ field: "value", message: "Expected boolean" }],
      };
    }

    return { success: true, data: value };
  }
}

function boolean(): BooleanValidator {
  return new BooleanValidator();
}

// ============================================
// ARRAY VALIDATOR
// ============================================

class ArrayValidator<T> extends Validator<T[]> {
  private minLengthValue?: number;
  private maxLengthValue?: number;
  private _unique: boolean = false;

  constructor(private itemValidator: Validator<T>) {
    super();
  }

  validate(value: unknown): ValidationResult<T[]> {
    if (!isArray(value)) {
      return {
        success: false,
        errors: [{ field: "value", message: "Expected array" }],
      };
    }

    const errors: ValidationError[] = [];

    if (this.minLengthValue !== undefined && value.length < this.minLengthValue) {
      errors.push({
        field: "value",
        message: `Array must have at least ${this.minLengthValue} items`,
      });
    }

    if (this.maxLengthValue !== undefined && value.length > this.maxLengthValue) {
      errors.push({
        field: "value",
        message: `Array must have at most ${this.maxLengthValue} items`,
      });
    }

    if (this._unique) {
      const uniqueValues = new Set(value);
      if (uniqueValues.size !== value.length) {
        errors.push({
          field: "value",
          message: "Array must contain unique values",
        });
      }
    }

    // Validar cada elemento
    const validatedItems: T[] = [];

    for (let i = 0; i < value.length; i++) {
      const itemResult = this.itemValidator.validate(value[i]);

      if (!itemResult.success) {
        itemResult.errors.forEach((error) => {
          errors.push({
            field: `[${i}].${error.field}`,
            message: error.message,
          });
        });
      } else {
        validatedItems.push(itemResult.data);
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: validatedItems };
  }

  minLength(length: number): this {
    this.minLengthValue = length;
    return this;
  }

  maxLength(length: number): this {
    this.maxLengthValue = length;
    return this;
  }

  unique(): this {
    this._unique = true;
    return this;
  }
}

function array<T>(itemValidator: Validator<T>): ArrayValidator<T> {
  return new ArrayValidator(itemValidator);
}

// ============================================
// OBJECT VALIDATOR
// ============================================

type Schema = Record<string, Validator<any>>;
type Infer<S extends Schema> = {
  [K in keyof S]: S[K] extends Validator<infer T> ? T : never;
};

class ObjectValidator<S extends Schema> extends Validator<Infer<S>> {
  constructor(private schema: S) {
    super();
  }

  validate(value: unknown): ValidationResult<Infer<S>> {
    if (!isObject(value)) {
      return {
        success: false,
        errors: [{ field: "value", message: "Expected object" }],
      };
    }

    const errors: ValidationError[] = [];
    const result: any = {};

    for (const key in this.schema) {
      const validator = this.schema[key];
      const fieldValue = value[key];

      const fieldResult = validator.validate(fieldValue);

      if (!fieldResult.success) {
        fieldResult.errors.forEach((error) => {
          errors.push({
            field: `${key}.${error.field}`,
            message: error.message,
          });
        });
      } else {
        result[key] = fieldResult.data;
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: result };
  }

  partial(): Validator<Partial<Infer<S>>> {
    const partialSchema: any = {};

    for (const key in this.schema) {
      partialSchema[key] = this.schema[key].optional();
    }

    return new ObjectValidator(partialSchema);
  }

  pick<K extends keyof S>(...keys: K[]): ObjectValidator<Pick<S, K>> {
    const picked: any = {};

    keys.forEach((key) => {
      picked[key] = this.schema[key];
    });

    return new ObjectValidator(picked);
  }

  omit<K extends keyof S>(...keys: K[]): ObjectValidator<Omit<S, K>> {
    const omitted: any = { ...this.schema };

    keys.forEach((key) => {
      delete omitted[key];
    });

    return new ObjectValidator(omitted);
  }
}

function object<S extends Schema>(schema: S): ObjectValidator<S> {
  return new ObjectValidator(schema);
}

// ============================================
// DISCRIMINATED UNIONS
// ============================================

type TextField = {
  type: "text";
  value: string;
  placeholder?: string;
};

type NumberField = {
  type: "number";
  value: number;
  min?: number;
  max?: number;
};

type EmailField = {
  type: "email";
  value: string;
};

type SelectField = {
  type: "select";
  value: string;
  options: string[];
};

type CheckboxField = {
  type: "checkbox";
  value: boolean;
};

type FormField =
  | TextField
  | NumberField
  | EmailField
  | SelectField
  | CheckboxField;

function processField(field: FormField): string {
  switch (field.type) {
    case "text":
      return `Text: ${field.value}`;

    case "number":
      const min = field.min ?? "no limit";
      const max = field.max ?? "no limit";
      return `Number: ${field.value} (${min} - ${max})`;

    case "email":
      return `Email: ${field.value}`;

    case "select":
      return `Select: ${field.value} from [${field.options.join(", ")}]`;

    case "checkbox":
      return `Checkbox: ${field.value ? "checked" : "unchecked"}`;

    default:
      // Exhaustive check
      const _exhaustive: never = field;
      throw new Error(`Unknown field type: ${_exhaustive}`);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

// ============================================
// BRANDED TYPES
// ============================================

type Brand<K, T> = K & { __brand: T };
type Email = Brand<string, "Email">;
type UUID = Brand<string, "UUID">;
type PositiveNumber = Brand<number, "Positive">;

function createEmail(value: string): Email | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) ? (value as Email) : null;
}

function createUUID(value: string): UUID | null {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value) ? (value as UUID) : null;
}

function createPositiveNumber(value: number): PositiveNumber | null {
  return value > 0 ? (value as PositiveNumber) : null;
}

// ============================================
// EJEMPLO DE USO
// ============================================

function demo(): void {
  console.log("=== DEMO: Type-Safe Validation ===\n");

  // 1. Validación básica
  console.log("1. Basic validation:");

  const nameResult = string().min(3).max(20).validate("John Doe");
  console.log("Name validation:", nameResult);

  const emailResult = string().email().validate("john@example.com");
  console.log("Email validation:", emailResult);

  const ageResult = number().min(0).max(120).integer().validate(30);
  console.log("Age validation:", ageResult);

  // 2. Validación de objetos
  console.log("\n2. Object validation:");

  const userSchema = object({
    name: string().min(3).max(50),
    email: string().email(),
    age: number().min(18).max(120).integer(),
    tags: array(string()).minLength(1).maxLength(5),
  });

  const userResult = userSchema.validate({
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    tags: ["developer", "typescript"],
  });

  console.log("User validation:", userResult);

  // 3. Validación fallida
  console.log("\n3. Failed validation:");

  const invalidResult = userSchema.validate({
    name: "Jo", // Muy corto
    email: "invalid-email",
    age: 15, // Muy joven
    tags: [], // Array vacío
  });

  if (!invalidResult.success) {
    console.log("Validation errors:");
    invalidResult.errors.forEach((error) => {
      console.log(`  - ${error.field}: ${error.message}`);
    });
  }

  // 4. Validadores opcionales
  console.log("\n4. Optional validators:");

  const profileSchema = object({
    name: string(),
    bio: string().optional(),
    age: number().optional().default(18),
  });

  const profile = profileSchema.validate({ name: "John" });
  console.log("Profile:", profile);

  // 5. Discriminated unions
  console.log("\n5. Discriminated unions:");

  const textField: FormField = {
    type: "text",
    value: "Hello",
    placeholder: "Enter text",
  };

  const numberField: FormField = {
    type: "number",
    value: 42,
    min: 0,
    max: 100,
  };

  console.log(processField(textField));
  console.log(processField(numberField));

  // 6. Branded types
  console.log("\n6. Branded types:");

  const email = createEmail("test@example.com");
  if (email) {
    console.log("Valid email:", email);
  }

  const invalidEmail = createEmail("not-an-email");
  console.log("Invalid email:", invalidEmail);
}

// ============================================
// TESTS
// ============================================

async function runTests(): Promise<void> {
  console.log("=== RUNNING TESTS ===\n");

  // Test 1: String validation
  const nameValidator = string().min(3).max(10);
  const result1 = nameValidator.validate("John");
  console.assert(result1.success === true, "❌ Test 1 failed");
  const result1b = nameValidator.validate("Jo");
  console.assert(result1b.success === false, "❌ Test 1 failed");
  console.log("✅ Test 1 passed: String validation");

  // Test 2: Email validation
  const emailValidator = string().email();
  const result2 = emailValidator.validate("test@example.com");
  console.assert(result2.success === true, "❌ Test 2 failed");
  const result3 = emailValidator.validate("invalid-email");
  console.assert(result3.success === false, "❌ Test 2 failed");
  console.log("✅ Test 2 passed: Email validation");

  // Test 3: Number validation
  const ageValidator = number().min(18).max(100);
  const result4 = ageValidator.validate(25);
  console.assert(result4.success === true, "❌ Test 3 failed");
  const result5 = ageValidator.validate(15);
  console.assert(result5.success === false, "❌ Test 3 failed");
  console.log("✅ Test 3 passed: Number validation");

  // Test 4: Object validation
  const userSchema = object({
    name: string().min(3),
    email: string().email(),
    age: number().min(18),
  });

  const result6 = userSchema.validate({
    name: "John Doe",
    email: "john@example.com",
    age: 30,
  });
  console.assert(result6.success === true, "❌ Test 4 failed");
  console.log("✅ Test 4 passed: Object validation");

  // Test 5: Type guards
  const value: unknown = "hello";
  console.assert(isString(value) === true, "❌ Test 5 failed");
  console.assert(isNumber(value) === false, "❌ Test 5 failed");
  console.log("✅ Test 5 passed: Type guards");

  // Test 6: Array validation
  const tagsValidator = array(string()).minLength(1).maxLength(5);
  const result7 = tagsValidator.validate(["tag1", "tag2"]);
  console.assert(result7.success === true, "❌ Test 6 failed");
  const result8 = tagsValidator.validate([]);
  console.assert(result8.success === false, "❌ Test 6 failed");
  console.log("✅ Test 6 passed: Array validation");

  // Test 7: Optional
  const optionalString = string().optional();
  const result9 = optionalString.validate(undefined);
  console.assert(result9.success === true, "❌ Test 7 failed");
  console.log("✅ Test 7 passed: Optional validation");

  // Test 8: Default
  const defaultNumber = number().default(42);
  const result10 = defaultNumber.validate(undefined);
  console.assert(result10.success === true, "❌ Test 8 failed");
  if (result10.success) {
    console.assert(result10.data === 42, "❌ Test 8 failed");
  }
  console.log("✅ Test 8 passed: Default validation");

  console.log("\n🎉 ALL TESTS PASSED!");
}

// Ejecutar
// demo();
runTests();

export {
  string,
  number,
  boolean,
  array,
  object,
  isString,
  isNumber,
  isArray,
  isObject,
  assertIsString,
  assertNonNull,
  FormField,
  processField,
  ValidationResult,
};
