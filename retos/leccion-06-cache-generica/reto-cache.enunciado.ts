/**
 * Reto: implementar una Cache genérica basada en un Map.
 *
 * Requisitos:
 *  - Debe ser genérica en clave y valor: Cache<K, V>
 *  - Debe exponer métodos: set, get, has, delete, clear
 *  - Opcional: método size que devuelva el número de elementos
 */

export interface Cache<K, V> {
  // TODO: declara los métodos de la cache
}

export class InMemoryCache<K, V> implements Cache<K, V> {
  // TODO: implementa la cache usando un Map<K, V> interno
}
