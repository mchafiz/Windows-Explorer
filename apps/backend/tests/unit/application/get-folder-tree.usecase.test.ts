import { describe, test, expect, mock, beforeEach } from 'bun:test'
import { GetFolderTree } from '../../../src/application/use-cases/GetFolderTree'
import type { IFolderRepository } from '../../../src/domain/ports/IFolderRepository'
import type { ICache } from '../../../src/domain/ports/ICache'
import type { FolderDto } from '../../../src/application/dtos/FolderDto'

const mockFolders = [
  { id: 'a1', name: 'Documents', parentId: null, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: 'b2', name: 'Work', parentId: 'a1', createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02') },
]

function makeRepo(overrides?: Partial<IFolderRepository>): IFolderRepository {
  return {
    findAll: mock(() => Promise.resolve(mockFolders)),
    findById: mock(() => Promise.resolve(null)),
    findChildren: mock(() => Promise.resolve([])),
    searchByName: mock(() => Promise.resolve([])),
    ...overrides,
  }
}

function makeCache(): ICache<FolderDto[]> {
  const store = new Map<string, FolderDto[]>()
  return {
    get: (key) => store.get(key) ?? null,
    set: (key, value) => { store.set(key, value) },
    invalidate: (key) => { store.delete(key) },
    clear: () => { store.clear() },
  }
}

describe('GetFolderTree', () => {
  let repo: IFolderRepository
  let cache: ICache<FolderDto[]>
  let useCase: GetFolderTree

  beforeEach(() => {
    repo = makeRepo()
    cache = makeCache()
    useCase = new GetFolderTree(repo, cache)
  })

  test('returns all folders as DTOs', async () => {
    const result = await useCase.execute()
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      id: 'a1',
      name: 'Documents',
      parentId: null,
      createdAt: '2024-01-01T00:00:00.000Z',
    })
  })

  test('caches result on first call', async () => {
    await useCase.execute()
    await useCase.execute()
    expect(repo.findAll).toHaveBeenCalledTimes(1)
  })

  test('hits repo again after cache miss (fresh cache)', async () => {
    const freshCache = makeCache()
    const uc = new GetFolderTree(repo, freshCache)
    await uc.execute()
    expect(repo.findAll).toHaveBeenCalledTimes(1)
  })
})
