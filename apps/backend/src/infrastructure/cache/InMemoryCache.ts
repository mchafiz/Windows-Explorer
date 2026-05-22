import type { ICache } from '../../domain/ports/ICache'

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export class InMemoryCache<T> implements ICache<T> {
  private readonly store = new Map<string, CacheEntry<T>>()

  get(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  set(key: string, value: T, ttlMs = 30_000): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs })
  }

  invalidate(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}
