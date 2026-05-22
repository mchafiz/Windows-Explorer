import type { Folder } from '../entities/Folder'

export interface IFolderRepository {
  findAll(): Promise<Folder[]>
  findById(id: string): Promise<Folder | null>
  findChildren(parentId: string): Promise<Folder[]>
  searchByName(query: string): Promise<Folder[]>
}
