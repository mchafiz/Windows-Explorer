export interface ICache<T> {
  get(key: string): T | null
  set(key: string, value: T, ttlMs?: number): void
  invalidate(key: string): void
  clear(): void
}
