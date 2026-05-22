import type { PrismaClient } from '@prisma/client'
import type { IFileRepository } from '../../domain/ports/IFileRepository'
import type { File } from '../../domain/entities/File'

export class PrismaFileRepository implements IFileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByFolderId(folderId: string): Promise<File[]> {
    const rows = await this.prisma.file.findMany({
      where: { folderId },
      orderBy: { name: 'asc' },
    })
    return rows.map(this.toDomain)
  }

  async searchByName(query: string): Promise<File[]> {
    const rows = await this.prisma.file.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      orderBy: { name: 'asc' },
      take: 50,
    })
    return rows.map(this.toDomain)
  }

  private toDomain(row: {
    id: string; name: string; folderId: string; mimeType: string | null
    size: bigint; createdAt: Date; updatedAt: Date
  }): File {
    return {
      id: row.id,
      name: row.name,
      folderId: row.folderId,
      mimeType: row.mimeType,
      size: Number(row.size),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
