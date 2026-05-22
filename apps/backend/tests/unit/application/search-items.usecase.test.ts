import { describe, test, expect, mock } from 'bun:test'
import { SearchItems } from '../../../src/application/use-cases/SearchItems'
import { AppError } from '../../../src/application/errors/AppError'
import type { IFolderRepository } from '../../../src/domain/ports/IFolderRepository'
import type { IFileRepository } from '../../../src/domain/ports/IFileRepository'

const folder = {
  id: 'f1', name: 'Holiday Photos', parentId: null,
  createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01'),
}
const file = {
  id: 'fi1', name: 'holiday.jpg', folderId: 'f1',
  mimeType: 'image/jpeg', size: 500_000,
  createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02'),
}

const folderRepo: IFolderRepository = {
  findAll: mock(() => Promise.resolve([])),
  findById: mock(() => Promise.resolve(null)),
  findChildren: mock(() => Promise.resolve([])),
  searchByName: mock(() => Promise.resolve([folder])),
}
const fileRepo: IFileRepository = {
  findByFolderId: mock(() => Promise.resolve([])),
  searchByName: mock(() => Promise.resolve([file])),
}

describe('SearchItems', () => {
  test('returns folders and files matching the query', async () => {
    const useCase = new SearchItems(folderRepo, fileRepo)
    const result = await useCase.execute('holiday')

    expect(result.folders).toHaveLength(1)
    expect(result.folders[0].name).toBe('Holiday Photos')
    expect(result.files).toHaveLength(1)
    expect(result.files[0].name).toBe('holiday.jpg')
    expect(result.meta.query).toBe('holiday')
    expect(result.meta.total).toBe(2)
  })

  test('type=folders skips file search', async () => {
    const fileRepoSpy: IFileRepository = {
      findByFolderId: mock(() => Promise.resolve([])),
      searchByName: mock(() => Promise.resolve([])),
    }
    const useCase = new SearchItems(folderRepo, fileRepoSpy)
    await useCase.execute('holiday', 'folders')
    expect(fileRepoSpy.searchByName).not.toHaveBeenCalled()
  })

  test('type=files skips folder search', async () => {
    const folderRepoSpy: IFolderRepository = {
      findAll: mock(() => Promise.resolve([])),
      findById: mock(() => Promise.resolve(null)),
      findChildren: mock(() => Promise.resolve([])),
      searchByName: mock(() => Promise.resolve([])),
    }
    const useCase = new SearchItems(folderRepoSpy, fileRepo)
    await useCase.execute('holiday', 'files')
    expect(folderRepoSpy.searchByName).not.toHaveBeenCalled()
  })

  test('throws on empty query', async () => {
    const useCase = new SearchItems(folderRepo, fileRepo)
    await expect(useCase.execute('  ')).rejects.toBeInstanceOf(AppError)
  })
})
