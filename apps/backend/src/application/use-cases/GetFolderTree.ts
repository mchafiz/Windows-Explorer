import type { IFolderRepository } from '../../domain/ports/IFolderRepository'
import type { ICache } from '../../domain/ports/ICache'
import type { FolderDto } from '../dtos/FolderDto'
import type { Folder } from '../../domain/entities/Folder'

const CACHE_KEY = 'all-folders'
const DEFAULT_TTL_MS = 30_000

export class GetFolderTree {
  constructor(
    private readonly folderRepo: IFolderRepository,
    private readonly cache: ICache<FolderDto[]>,
  ) {}

  async execute(): Promise<FolderDto[]> {
    const cached = this.cache.get(CACHE_KEY)
    if (cached) return cached

    const folders = await this.folderRepo.findAll()
    const dtos = folders.map(this.toDto)
    this.cache.set(CACHE_KEY, dtos, DEFAULT_TTL_MS)
    return dtos
  }

  private toDto(folder: Folder): FolderDto {
    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      createdAt: folder.createdAt.toISOString(),
    }
  }
}
