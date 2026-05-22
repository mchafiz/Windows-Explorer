import { describe, test, expect } from 'bun:test'
import { InMemoryCache } from '../../../src/infrastructure/cache/InMemoryCache'

describe('InMemoryCache', () => {
  test('returns null for unknown key', () => {
    const cache = new InMemoryCache<string>()
    expect(cache.get('missing')).toBeNull()
  })

  test('stores and retrieves a value', () => {
    const cache = new InMemoryCache<string>()
    cache.set('key', 'value')
    expect(cache.get('key')).toBe('value')
  })

  test('returns null after TTL expires', async () => {
    const cache = new InMemoryCache<string>()
    cache.set('key', 'value', 10) // 10ms TTL
    await Bun.sleep(20)
    expect(cache.get('key')).toBeNull()
  })

  test('invalidate removes a specific key', () => {
    const cache = new InMemoryCache<string>()
    cache.set('a', 'one')
    cache.set('b', 'two')
    cache.invalidate('a')
    expect(cache.get('a')).toBeNull()
    expect(cache.get('b')).toBe('two')
  })

  test('clear removes all keys', () => {
    const cache = new InMemoryCache<string>()
    cache.set('a', 'one')
    cache.set('b', 'two')
    cache.clear()
    expect(cache.get('a')).toBeNull()
    expect(cache.get('b')).toBeNull()
  })
})
