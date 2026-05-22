import type { IFolderRepository } from '../../domain/ports/IFolderRepository'
import type { IFileRepository } from '../../domain/ports/IFileRepository'
import type { FolderDto } from '../dtos/FolderDto'
import type { FileDto } from '../dtos/FileDto'
import type { Folder } from '../../domain/entities/Folder'
import type { File } from '../../domain/entities/File'
import { Errors } from '../errors/AppError'

export interface ChildrenResult {
  folders: FolderDto[]
  files: FileDto[]
}

export class GetFolderChildren {
  constructor(
    private readonly folderRepo: IFolderRepository,
    private readonly fileRepo: IFileRepository,
  ) {}

  async execute(folderId: string): Promise<ChildrenResult> {
    const folder = await this.folderRepo.findById(folderId)
    if (!folder) throw Errors.folderNotFound(folderId)

    const [folders, files] = await Promise.all([
      this.folderRepo.findChildren(folderId),
      this.fileRepo.findByFolderId(folderId),
    ])

    return {
      folders: folders.map(this.folderToDto),
      files: files.map(this.fileToDto),
    }
  }

  private folderToDto(f: Folder): FolderDto {
    return { id: f.id, name: f.name, parentId: f.parentId, createdAt: f.createdAt.toISOString() }
  }

  private fileToDto(f: File): FileDto {
    return {
      id: f.id,
      name: f.name,
      folderId: f.folderId,
      mimeType: f.mimeType,
      size: f.size,
      createdAt: f.createdAt.toISOString(),
    }
  }
}
