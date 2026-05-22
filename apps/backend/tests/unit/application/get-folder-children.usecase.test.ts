import { describe, test, expect, mock } from 'bun:test'
import { GetFolderChildren } from '../../../src/application/use-cases/GetFolderChildren'
import { AppError } from '../../../src/application/errors/AppError'
import type { IFolderRepository } from '../../../src/domain/ports/IFolderRepository'
import type { IFileRepository } from '../../../src/domain/ports/IFileRepository'

const parentFolder = {
  id: 'parent-1', name: 'Documents', parentId: null,
  createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01'),
}
const childFolder = {
  id: 'child-1', name: 'Work', parentId: 'parent-1',
  createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02'),
}
const childFile = {
  id: 'file-1', name: 'resume.pdf', folderId: 'parent-1',
  mimeType: 'application/pdf', size: 245_000,
  createdAt: new Date('2024-01-03'), updatedAt: new Date('2024-01-03'),
}

function makeRepo(found: boolean): IFolderRepository {
  return {
    findAll: mock(() => Promise.resolve([])),
    findById: mock(() => Promise.resolve(found ? parentFolder : null)),
    findChildren: mock(() => Promise.resolve([childFolder])),
    searchByName: mock(() => Promise.resolve([])),
  }
}

function makeFileRepo(): IFileRepository {
  return {
    findByFolderId: mock(() => Promise.resolve([childFile])),
    searchByName: mock(() => Promise.resolve([])),
  }
}

describe('GetFolderChildren', () => {
  test('returns subfolders and files for a valid folder', async () => {
    const useCase = new GetFolderChildren(makeRepo(true), makeFileRepo())
    const result = await useCase.execute('parent-1')

    expect(result.folders).toHaveLength(1)
    expect(result.folders[0].name).toBe('Work')
    expect(result.files).toHaveLength(1)
    expect(result.files[0].name).toBe('resume.pdf')
    expect(result.files[0].size).toBe(245_000)
  })

  test('throws AppError when folder does not exist', async () => {
    const useCase = new GetFolderChildren(makeRepo(false), makeFileRepo())
    await expect(useCase.execute('ghost-id')).rejects.toBeInstanceOf(AppError)
  })

  test('fetches folders and files in parallel', async () => {
    const folderRepo = makeRepo(true)
    const fileRepo = makeFileRepo()
    const useCase = new GetFolderChildren(folderRepo, fileRepo)
    await useCase.execute('parent-1')
    expect(folderRepo.findChildren).toHaveBeenCalledWith('parent-1')
    expect(fileRepo.findByFolderId).toHaveBeenCalledWith('parent-1')
  })
})
