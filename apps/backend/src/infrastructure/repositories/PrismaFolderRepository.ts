import type { PrismaClient } from '@prisma/client'
import type { IFolderRepository } from '../../domain/ports/IFolderRepository'
import type { Folder } from '../../domain/entities/Folder'

export class PrismaFolderRepository implements IFolderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Folder[]> {
    const rows = await this.prisma.folder.findMany({ orderBy: { name: 'asc' } })
    return rows.map(this.toDomain)
  }

  async findById(id: string): Promise<Folder | null> {
    const row = await this.prisma.folder.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findChildren(parentId: string): Promise<Folder[]> {
    const rows = await this.prisma.folder.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
    })
    return rows.map(this.toDomain)
  }

  async searchByName(query: string): Promise<Folder[]> {
    const rows = await this.prisma.folder.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      orderBy: { name: 'asc' },
      take: 50,
    })
    return rows.map(this.toDomain)
  }

  private toDomain(row: {
    id: string; name: string; parentId: string | null
    createdAt: Date; updatedAt: Date
  }): Folder {
    return {
      id: row.id,
      name: row.name,
      parentId: row.parentId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
