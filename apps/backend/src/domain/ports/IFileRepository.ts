import type { File } from '../entities/File'

export interface IFileRepository {
  findByFolderId(folderId: string): Promise<File[]>
  searchByName(query: string): Promise<File[]>
}
