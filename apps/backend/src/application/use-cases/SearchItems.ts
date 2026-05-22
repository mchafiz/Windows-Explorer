import type { IFolderRepository } from '../../domain/ports/IFolderRepository'
import type { IFileRepository } from '../../domain/ports/IFileRepository'
import type { FolderDto } from '../dtos/FolderDto'
import type { FileDto } from '../dtos/FileDto'
import type { Folder } from '../../domain/entities/Folder'
import type { File } from '../../domain/entities/File'
import { Errors } from '../errors/AppError'

export type SearchType = 'all' | 'folders' | 'files'

export interface SearchResult {
  folders: FolderDto[]
  files: FileDto[]
  meta: { query: string; total: number }
}

export class SearchItems {
  constructor(
    private readonly folderRepo: IFolderRepository,
    private readonly fileRepo: IFileRepository,
  ) {}

  async execute(query: string, type: SearchType = 'all'): Promise<SearchResult> {
    if (!query.trim()) throw Errors.invalidSearchQuery()

    const [folders, files] = await Promise.all([
      type !== 'files' ? this.folderRepo.searchByName(query) : Promise.resolve([]),
      type !== 'folders' ? this.fileRepo.searchByName(query) : Promise.resolve([]),
    ])

    const folderDtos = folders.map((f: Folder): FolderDto => ({
      id: f.id, name: f.name, parentId: f.parentId, createdAt: f.createdAt.toISOString(),
    }))

    const fileDtos = files.map((f: File): FileDto => ({
      id: f.id, name: f.name, folderId: f.folderId,
      mimeType: f.mimeType, size: f.size, createdAt: f.createdAt.toISOString(),
    }))

    return {
      folders: folderDtos,
      files: fileDtos,
      meta: { query, total: folderDtos.length + fileDtos.length },
    }
  }
}
