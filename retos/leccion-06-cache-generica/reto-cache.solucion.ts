export interface Cache<K, V> {
  set(key: K, value: V): void;
  get(key: K): V | undefined;
  has(key: K): boolean;
  delete(key: K): void;
  clear(): void;
  size(): number;
}

export class InMemoryCache<K, V> implements Cache<K, V> {
  private store = new Map<K, V>();

  set(key: K, value: V): void {
    this.store.set(key, value);
  }

  get(key: K): V | undefined {
    return this.store.get(key);
  }

  has(key: K): boolean {
    return this.store.has(key);
  }

  delete(key: K): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

const cache = new InMemoryCache<string, number>();

async function heavyOperation(input: string): Promise<number> {
  if (cache.has(input)) {
    console.log("Leyendo de la cache...");
    return cache.get(input)!;
  }

  console.log("Computando resultado pesado...");
  await new Promise((resolve) => setTimeout(resolve, 500));
  const result = input.length * Math.random();

  cache.set(input, result);
  return result;
}

async function demo() {
  console.log(await heavyOperation("typescript"));
  console.log(await heavyOperation("typescript"));
}

demo();
